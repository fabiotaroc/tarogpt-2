import {
  StateGraph,
  END,
  START,
  Annotation,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  isAIMessage,
} from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import { SYSTEM_PROMPT } from "./prompts";
import { tools } from "./tools";
import { maskSensitiveData } from "@/lib/utils";
import { PostgresError, RowData } from "@/lib/types";

// Define the state for our workflow with annotations
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  currentQuestion: Annotation<string>(),
  sqlQuery: Annotation<string | undefined>(),
  queryResults: Annotation<RowData[] | undefined>(),
  chartRecommendation: Annotation<ChartRecommendation | undefined>(),
  insight: Annotation<string | undefined>(),
  nodeVisitCounts: Annotation<Record<string, number>>(), // Track node visits
  errors: Annotation<PostgresError[] | undefined>(), // Track errors for retry logic
  retryCount: Annotation<number>(), // Track retry attempts
});

// Define the ChartRecommendation type
interface ChartRecommendation {
  chartType: string;
  title: string;
  [key: string]: unknown;
}

// Export the state type for use in the API route
export type AgentState = typeof GraphAnnotation.State;

// Create a workflow builder using StateGraph
export function createDataAnalystAgent() {
  console.log("🔄 Initializing Data Analyst Agent workflow");
  const startTime = Date.now();

  // Initialize the LLM
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    streaming: true,
  });

  // Create a tool node for executing tools
  const toolNode = new ToolNode(tools);

  // Add a wrapper around the ToolNode to add logging
  const toolNodeWithLogging = async (state: AgentState) => {
    const { messages, nodeVisitCounts = {} } = state;
    const visitCount = (nodeVisitCounts.tools || 0) + 1;

    console.log(`🔧 [Tools Node] Visit #${visitCount} - Processing tool calls`);

    // Count visits to this node
    const updatedCounts = {
      ...nodeVisitCounts,
      tools: visitCount,
    };

    // Get the last message which should contain tool calls
    const lastMessage = messages[messages.length - 1];
    if (isAIMessage(lastMessage) && lastMessage.tool_calls?.length) {
      console.log(
        `🔧 [Tools Node] Executing ${lastMessage.tool_calls.length} tool calls:`
      );
      lastMessage.tool_calls.forEach((call, index) => {
        console.log(
          `  - Tool call #${index + 1}: ${call.name} with args: ${JSON.stringify(call.args)}`
        );
      });
    }

    // Execute the tools using the original ToolNode's invoke method
    // We need to use the state directly since ToolNode is not directly callable
    const result = await toolNode.invoke(state);

    console.log(`✅ [Tools Node] Tool execution completed`);

    return {
      ...result,
      nodeVisitCounts: updatedCounts,
    };
  };

  // Define the main agent node that decides what to do
  const agentNode = async (state: AgentState) => {
    const { messages, nodeVisitCounts = {}, currentQuestion } = state;
    const visitCount = (nodeVisitCounts.agent || 0) + 1;

    console.log(
      `🤖 [Agent Node] Visit #${visitCount} - Processing question: "${currentQuestion}"`
    );

    // Count visits to this node
    const updatedCounts = {
      ...nodeVisitCounts,
      agent: visitCount,
    };

    // If we've visited this node too many times, don't add more messages
    if (updatedCounts.agent > 8) {
      console.log(
        `⚠️ [Agent Node] Maximum visits (8) reached, stopping further processing`
      );
      return {
        messages,
        nodeVisitCounts: updatedCounts,
      };
    }

    const systemMessage = new SystemMessage(SYSTEM_PROMPT);

    // Bind tools to the model
    const llmWithTools = model.bindTools(tools);

    console.log(
      `🧠 [Agent Node] Invoking LLM with ${messages.length} messages`
    );

    // Invoke the model with the current messages
    const result = await llmWithTools.invoke([systemMessage, ...messages]);

    // Log tool calls if present
    if (result.tool_calls?.length) {
      console.log(
        `🔧 [Agent Node] LLM requested ${result.tool_calls.length} tool calls:`
      );
      result.tool_calls.forEach((call, index) => {
        console.log(`  - Tool call #${index + 1}: ${call.name}`);
      });
    } else {
      console.log(`💬 [Agent Node] LLM responded without tool calls`);
    }

    return {
      messages: [...messages, result],
      nodeVisitCounts: updatedCounts,
    };
  };

  // Define a node to process SQL queries with retry logic
  const processSQLNode = async (state: AgentState) => {
    const {
      messages,
      currentQuestion,
      sqlQuery,
      nodeVisitCounts = {},
      errors = [],
      retryCount = 0,
    } = state;

    const visitCount = (nodeVisitCounts.process_sql || 0) + 1;
    console.log(
      `🔍 [Process SQL Node] Visit #${visitCount} - Processing SQL for: "${currentQuestion}"`
    );
    console.log(
      `🔍 [Process SQL Node] Runtime environment: ${process.env.VERCEL_REGION || "local"}`
    );
    console.log(
      `🔍 [Process SQL Node] Edge runtime: ${typeof process.env.EDGE_RUNTIME !== "undefined" ? "Yes" : "No"}`
    );

    // Count visits to this node
    const updatedCounts = {
      ...nodeVisitCounts,
      process_sql: visitCount,
    };

    // Maximum number of retries for SQL translation
    const MAX_RETRIES = 3;

    if (retryCount >= MAX_RETRIES) {
      console.log(
        `⚠️ [Process SQL Node] Maximum retries (${MAX_RETRIES}) reached, stopping further attempts`
      );

      // Add a message to inform the agent about the failure
      const errorMessage = new HumanMessage(
        `After ${MAX_RETRIES} attempts, I was unable to execute a valid SQL query. The last error was: ${
          errors[errors.length - 1]?.message || "Unknown error"
        }`
      );

      return {
        messages: [...messages, errorMessage],
        nodeVisitCounts: updatedCounts,
        retryCount,
        errors,
      };
    }

    // If we have a SQL query from a previous step, mask sensitive data for logging
    if (sqlQuery) {
      const maskedQuery = maskSensitiveData(sqlQuery);
      console.log(
        `🔍 [Process SQL Node] Using SQL query: ${maskedQuery.substring(0, 100)}${maskedQuery.length > 100 ? "..." : ""}`
      );
    }

    // If we're retrying, inform the agent about previous errors
    let updatedMessages = [...messages];
    if (retryCount > 0 && errors.length > 0) {
      const lastError = errors[errors.length - 1];
      const retryMessage = new HumanMessage(
        `The previous SQL query failed with error: ${lastError.message}. Please try again with a corrected query.`
      );
      updatedMessages = [...messages, retryMessage];
      console.log(
        `🔄 [Process SQL Node] Retry #${retryCount} due to error: ${lastError.message}`
      );
    }

    return {
      messages: updatedMessages,
      nodeVisitCounts: updatedCounts,
      retryCount,
      errors,
    };
  };

  // Define a node to process results in parallel (insights and visualization)
  // This is the main analysis node that handles both insight generation and chart recommendation
  const processResultsInParallelNode = async (state: AgentState) => {
    const {
      messages,
      queryResults,
      sqlQuery,
      currentQuestion,
      nodeVisitCounts = {},
    } = state;

    const visitCount = (nodeVisitCounts.parallel_processing || 0) + 1;
    console.log(
      `⚡ [Parallel Processing Node] Visit #${visitCount} - Processing results for: "${currentQuestion}"`
    );

    // Count visits to this node
    const updatedCounts = {
      ...nodeVisitCounts,
      parallel_processing: visitCount,
    };

    if (!queryResults || queryResults.length === 0 || !sqlQuery) {
      console.log(
        `⚠️ [Parallel Processing Node] Missing query results or SQL query, skipping`
      );
      return { ...state, nodeVisitCounts: updatedCounts };
    }

    console.log(
      `⚡ [Parallel Processing Node] Processing ${queryResults.length} rows in parallel for insights and visualization`
    );

    try {
      // Find the tools we need from the tools array
      const generateInsightTool = tools.find(
        (tool) => tool.name === "generate_insight"
      );
      const chartRecommendationTool = tools.find(
        (tool) => tool.name === "get_chart_recommendation"
      );

      if (!generateInsightTool || !chartRecommendationTool) {
        throw new Error("Required tools not found in tools array");
      }

      // Create prompts for the messages
      const analysisPrompt = `Based on the query results for "${currentQuestion}", please analyze the data and provide key insights.`;
      const vizPrompt = `Based on the SQL query and results, what type of visualization would be most appropriate?`;

      // Run both tasks in parallel
      console.log(`⚡ [Parallel Processing Node] Starting parallel processing`);
      const [insight, recommendationJson] = await Promise.all([
        generateInsightTool.invoke({
          userQuestion: currentQuestion,
          queryResult: queryResults,
        }),
        chartRecommendationTool.invoke({
          userQuestion: currentQuestion,
          sqlQuery: sqlQuery,
          rowCount: queryResults.length,
        }),
      ]);

      // Parse the JSON string returned by the chart recommendation tool
      const chartRecommendation = JSON.parse(recommendationJson);

      console.log(
        `✅ [Parallel Processing Node] Parallel processing completed successfully`
      );

      // Create messages for the conversation
      const analysisHumanMessage = new HumanMessage(analysisPrompt);
      const analysisAIMessage = { content: insight, role: "assistant" };
      const vizHumanMessage = new HumanMessage(vizPrompt);

      // Update messages with both results
      const updatedMessages = [
        ...messages,
        analysisHumanMessage,
        analysisAIMessage,
        vizHumanMessage,
      ];

      return {
        messages: updatedMessages,
        insight: insight,
        chartRecommendation,
        nodeVisitCounts: updatedCounts,
      };
    } catch (error) {
      console.error(
        `❌ [Parallel Processing Node] Error during parallel processing:`,
        error
      );
      return {
        ...state,
        nodeVisitCounts: updatedCounts,
      };
    }
  };

  // Define a node to summarize findings
  const summarizeNode = async (state: AgentState) => {
    const {
      messages,
      sqlQuery,
      queryResults,
      chartRecommendation,
      insight,
      currentQuestion,
      nodeVisitCounts = {},
    } = state;

    const visitCount = (nodeVisitCounts.summarize || 0) + 1;
    console.log(
      `📝 [Summarize Node] Visit #${visitCount} - Summarizing findings for: "${currentQuestion}"`
    );

    // Count visits to this node
    const updatedCounts = {
      ...nodeVisitCounts,
      summarize: visitCount,
    };

    // Create a summary prompt
    const summaryPrompt = `Based on the analysis performed:
    
    SQL Query: ${sqlQuery ? maskSensitiveData(sqlQuery) : "No query executed"}
    Results: ${queryResults ? JSON.stringify(queryResults.slice(0, 5)) + (queryResults.length > 5 ? ` (and ${queryResults.length - 5} more rows)` : "") : "No results available"}
    ${chartRecommendation ? `Chart: ${JSON.stringify(chartRecommendation)}` : "No chart recommendation available"}
    ${insight ? `Insights: ${insight}` : "No insights available"}
    
    Please provide a concise summary of the findings that directly answers the user's original question: "${currentQuestion}"
    
    Focus on the most important insights and data points. Be precise and informative.`;

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...messages,
      new HumanMessage(summaryPrompt),
    ]);

    console.log(`✅ [Summarize Node] Generated final summary successfully`);

    return {
      ...state,
      messages: [...messages, new HumanMessage(summaryPrompt), response],
      nodeVisitCounts: updatedCounts,
    };
  };

  // Define routing logic with simplified workflow
  // The workflow now uses fewer nodes, focusing on parallel processing for efficiency
  const shouldContinue = (state: AgentState) => {
    const {
      messages,
      queryResults,
      chartRecommendation,
      insight,
      nodeVisitCounts = {},
      currentQuestion,
      retryCount = 0,
      errors = [],
    } = state;

    // Safety check: limit total iterations
    const totalVisits = Object.values(nodeVisitCounts).reduce(
      (a, b) => a + b,
      0
    );

    console.log(
      `🔄 [Router] Deciding next step for question: "${currentQuestion}"`
    );
    console.log(
      `🔄 [Router] Total node visits: ${totalVisits}, Node visit counts:`,
      nodeVisitCounts
    );

    // Log the current state for debugging
    console.log(`🔄 [Router] Current state summary:`);
    console.log(`  - Has query results: ${queryResults ? "Yes" : "No"}`);
    console.log(
      `  - Has chart recommendation: ${chartRecommendation ? "Yes" : "No"}`
    );
    console.log(`  - Has insight: ${insight ? "Yes" : "No"}`);
    console.log(`  - Has errors: ${errors.length > 0 ? "Yes" : "No"}`);
    console.log(`  - Retry count: ${retryCount}`);
    console.log(
      `  - Runtime context: ${process.env.VERCEL_REGION || "local"}, Edge: ${typeof process.env.EDGE_RUNTIME !== "undefined" ? "Yes" : "No"}`
    );

    if (totalVisits > 15) {
      console.log(
        `⚠️ [Router] Maximum total visits (15) reached, ending workflow`
      );
      return END;
    }

    const lastMessage = messages[messages.length - 1];

    // Check if the last message is an AI message with tool calls
    if (isAIMessage(lastMessage) && lastMessage.tool_calls?.length) {
      console.log(`🔧 [Router] Detected tool calls, routing to tools node`);
      // Log the tool calls for debugging
      lastMessage.tool_calls.forEach((call, index) => {
        console.log(`  - Tool call #${index + 1}: ${call.name}`);
        if (call.name === "execute_sql") {
          console.log(
            `  - SQL query: ${JSON.stringify(call.args).substring(0, 100)}...`
          );
        }
      });
      return "tools";
    }

    // Check if we need to process SQL with retry logic
    if (errors.length > 0 && retryCount < 3) {
      console.log(
        `🔄 [Router] SQL errors detected, routing to process_sql for retry`
      );
      console.log(`  - Last error: ${errors[errors.length - 1]?.message}`);
      return "process_sql";
    }

    // If we have query results but no insights or chart recommendation, process in parallel
    if (
      queryResults &&
      queryResults.length > 0 &&
      (!insight || !chartRecommendation)
    ) {
      console.log(
        `⚡ [Router] Query results available, routing to parallel processing`
      );
      return "parallel_processing";
    }

    // If we have all the data, summarize
    if (
      queryResults &&
      queryResults.length > 0 &&
      insight &&
      chartRecommendation
    ) {
      console.log(
        `📝 [Router] All analysis complete, routing to summarize node`
      );
      return "summarize";
    }

    console.log(`🏁 [Router] No further processing needed, ending workflow`);
    return END;
  };

  // Create the workflow graph with a streamlined architecture
  const workflow = new StateGraph(GraphAnnotation)
    // Add nodes - simplified to essential components only
    .addNode("agent", agentNode)
    .addNode("tools", toolNodeWithLogging)
    .addNode("process_sql", processSQLNode)
    .addNode("parallel_processing", processResultsInParallelNode)
    .addNode("summarize", summarizeNode)

    // Define edges
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addEdge("process_sql", "agent")
    .addEdge("parallel_processing", "agent")
    .addEdge("summarize", END)

    // Add conditional routing
    .addConditionalEdges("agent", shouldContinue, [
      "tools",
      "process_sql",
      "parallel_processing",
      "summarize",
      END,
    ]);

  console.log(
    `✅ Data Analyst Agent workflow initialized successfully in ${Date.now() - startTime}ms`
  );

  // Create a wrapper around the workflow to track execution time
  const originalCompile = workflow.compile.bind(workflow);
  workflow.compile = function () {
    console.log(
      `⏱️ [Workflow] Starting compilation at ${new Date().toISOString()}`
    );
    const result = originalCompile();
    console.log(
      `⏱️ [Workflow] Compilation completed at ${new Date().toISOString()}`
    );
    return result;
  };

  // Create a wrapper around the workflow's invoke method to track execution time
  const compiledGraph = workflow.compile();
  const originalInvoke = compiledGraph.invoke.bind(compiledGraph);

  compiledGraph.invoke = async function (input) {
    const runStartTime = Date.now();
    console.log(
      `🚀 [Workflow] Starting execution at ${new Date().toISOString()}`
    );

    // Safely log the input question if available
    if (input && typeof input === "object" && "currentQuestion" in input) {
      console.log(`🔍 [Workflow] Input question: "${input.currentQuestion}"`);
    } else {
      console.log(`🔍 [Workflow] Starting execution with input:`, input);
    }

    try {
      const result = await originalInvoke(input);

      const executionTime = Date.now() - runStartTime;
      console.log(
        `🏁 [Workflow] Execution completed in ${executionTime}ms (${(executionTime / 1000).toFixed(2)}s)`
      );

      return result;
    } catch (error) {
      console.error(
        `❌ [Workflow] Execution failed after ${Date.now() - runStartTime}ms:`,
        error
      );
      throw error;
    }
  };

  return compiledGraph;
}
