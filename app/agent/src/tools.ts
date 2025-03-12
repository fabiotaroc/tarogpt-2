/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  translateSQL,
  executeSQL,
  getRecommendedChartType,
  generateInsight,
} from "@/app/actions";

/**
 * Tool that translates a natural language question into SQL
 */
export const translateSQLTool = tool(
  async (input) => {
    // @ts-ignore - Input type is complex but works at runtime
    const { userQuestion, previousQuery, previousError } = input;
    console.log(
      `🔍 [Tool: translate_sql] Translating question to SQL: "${userQuestion}"`
    );
    try {
      const sql = await translateSQL(
        userQuestion,
        previousQuery,
        previousError
      );
      console.log(
        `✅ [Tool: translate_sql] Successfully generated SQL: ${sql.substring(0, 100)}${sql.length > 100 ? "..." : ""}`
      );
      return sql;
    } catch (e) {
      console.warn("❌ [Tool: translate_sql] Error translating to SQL", e);
      return `An error occurred while translating to SQL: ${e}`;
    }
  },
  {
    name: "translate_sql",
    description:
      "Translates a user question into a PostgreSQL query. This tool should be used when you need to create a SQL query from a natural language question. If a previous query failed, provide the error details to help generate a corrected query.",
    schema: z.object({
      userQuestion: z
        .string()
        .describe("The user's question to translate to SQL"),
      previousQuery: z
        .string()
        .optional()
        .describe("The previous SQL query that may have failed"),
      previousError: z
        .object({
          code: z.string(),
          message: z.string(),
          detail: z.string().optional(),
        })
        .optional()
        .describe("Details about a previous query error"),
    }),
  }
);

/**
 * Tool that executes a SQL query against the database
 */
export const executeSQLTool = tool(
  async (input) => {
    // @ts-ignore - Input type is complex but works at runtime
    const { query } = input;
    console.log(
      `🔍 [Tool: execute_sql] Executing SQL query: ${query.substring(0, 100)}${query.length > 100 ? "..." : ""}`
    );
    console.log(
      `🔍 [Tool: execute_sql] Runtime environment: ${process.env.VERCEL_REGION || "local"}`
    );
    console.log(
      `🔍 [Tool: execute_sql] Edge runtime: ${typeof process.env.EDGE_RUNTIME !== "undefined" ? "Yes" : "No"}`
    );
    console.log(`🔍 [Tool: execute_sql] Node.js version: ${process.version}`);

    try {
      console.log(`🔍 [Tool: execute_sql] About to call executeSQL function`);
      const result = await executeSQL(query);
      console.log(
        `🔍 [Tool: execute_sql] executeSQL function returned:`,
        typeof result,
        result.success ? "Success" : "Failed"
      );

      if (!result.success) {
        console.warn(`❌ [Tool: execute_sql] Query execution failed:`, {
          error: result.error,
          code: result.code,
          details: result.details,
        });
        return JSON.stringify({
          success: false,
          // @ts-ignore - Error handling is complex but works at runtime
          error: String(result.error),
        });
      }

      console.log(
        `✅ [Tool: execute_sql] Query executed successfully, returned ${Array.isArray(result.data) ? result.data.length : 0} rows`
      );
      return JSON.stringify(result.data);
    } catch (e) {
      console.warn("❌ [Tool: execute_sql] Unexpected error executing SQL", e);
      if (e && typeof e === "object") {
        console.warn(
          "❌ [Tool: execute_sql] Error type:",
          (e as Error)?.constructor?.name
        );
        console.warn(
          "❌ [Tool: execute_sql] Error message:",
          (e as Error)?.message
        );
        console.warn(
          "❌ [Tool: execute_sql] Error stack:",
          (e as Error)?.stack
        );
      }
      return JSON.stringify({
        success: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  },
  {
    name: "execute_sql",
    description:
      "Executes a SQL query against the database and returns the results. This tool should be used after generating a SQL query with translate_sql.",
    schema: z.object({
      query: z.string().describe("The SQL query to execute"),
    }),
  }
);

/**
 * Tool that recommends a chart type based on query results
 */
export const getChartRecommendationTool = tool(
  async (input) => {
    // @ts-ignore - Input type is complex but works at runtime
    const { userQuestion, sqlQuery, rowCount } = input;
    console.log(
      `📊 [Tool: get_chart_recommendation] Getting chart recommendation for question: "${userQuestion}"`
    );
    try {
      const recommendation = await getRecommendedChartType(
        userQuestion,
        sqlQuery,
        rowCount
      );
      console.log(
        `✅ [Tool: get_chart_recommendation] Recommended chart type: ${recommendation.chartType}`
      );
      return JSON.stringify(recommendation);
    } catch (e) {
      console.warn(
        "❌ [Tool: get_chart_recommendation] Error getting chart recommendation",
        e
      );
      return JSON.stringify({
        chartType: "table",
        title: "Data Table",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  },
  {
    name: "get_chart_recommendation",
    description:
      "Recommends an appropriate chart type based on the user question, SQL query, and result data. This tool should be used after executing a query to determine how to best visualize the results.",
    schema: z.object({
      userQuestion: z
        .string()
        .describe("The original user question that prompted the query"),
      sqlQuery: z.string().describe("The SQL query that was executed"),
      rowCount: z.number().describe("The number of rows in the query result"),
    }),
  }
);

/**
 * Tool that generates insights from query results
 */
export const generateInsightTool = tool(
  async (input) => {
    // @ts-ignore - Input type is complex but works at runtime
    const { userQuestion, queryResult } = input;
    console.log(
      `💡 [Tool: generate_insight] Generating insights for question: "${userQuestion}" with ${Array.isArray(queryResult) ? queryResult.length : 0} rows of data`
    );
    try {
      const insight = await generateInsight(userQuestion, queryResult);
      console.log(
        `✅ [Tool: generate_insight] Successfully generated insights`
      );
      return insight;
    } catch (e) {
      console.warn("❌ [Tool: generate_insight] Error generating insight", e);
      return `An error occurred while generating insights: ${e instanceof Error ? e.message : String(e)}`;
    }
  },
  {
    name: "generate_insight",
    description:
      "Generates insights from query results based on the user's original question. This tool should be used after executing a query to analyze the results and provide meaningful observations.",
    schema: z.object({
      userQuestion: z
        .string()
        .describe("The original user question that prompted the query"),
      queryResult: z
        .array(z.record(z.any()))
        .describe("The query results to analyze"),
    }),
  }
);

/**
 * Tools collection for the LangGraph agent
 */
export const tools = [
  translateSQLTool,
  executeSQLTool,
  getChartRecommendationTool,
  generateInsightTool,
];
