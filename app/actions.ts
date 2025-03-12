"use server";

import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { tableSchema } from "@/lib/ai-config";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { RowData, type Query, PostgresError } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChartRecommendation, CHART_TYPES } from "@/lib/types";
import { Prisma } from "@prisma/client";

export async function translateSQL(
  userQuestion: string,
  previousQuery?: string,
  previousError?: PostgresError
) {
  const errorContext = previousError
    ? `
    Previous query failed with error code ${previousError.code}: ${previousError.message}
    Failed query: ${previousQuery}
    Please fix the issues and generate a new query.
    `
    : "";

  const prompt = `
    You are an expert in PostgreSQL and have intimate knowledge of this table schema: ${tableSchema}

    Read the user question: ${userQuestion}
    ${errorContext}
    
    Reason about what to extract from the database to best answer the user question, 
    and output a valid PostgreSQL SELECT query.

    If there was a previous error:
    1. Analyze the error message carefully
    2. Ensure the new query addresses the specific error
    3. Validate column names and syntax
    4. Consider adding appropriate WHERE clauses or JOIN conditions
    `;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    prompt: prompt,
    output: "array",
    schema: z.object({
      query: z.string().describe("The SQL query"),
    }),
  });
  return object[0].query;
}

export async function getRecommendedChartType(
  userQuestion: string,
  sqlQuery: string,
  rowCount: number
): Promise<ChartRecommendation> {
  const prompt = `
    As a data visualization expert, analyze this user question and its corresponding SQL query to recommend the most appropriate chart type and title.
    
    User Question: ${userQuestion}
    SQL Query: ${sqlQuery}
    Number of Rows: ${rowCount}

    Available chart types are: ${Object.values(CHART_TYPES).join(", ")}

    Follow these rules strictly:
    1. If the number of rows is 10 or less, use a pie chart
    2. If the data contains dates or timestamps, use a line chart
    3. Otherwise, use a bar chart

    Generate:
    1. A chart type following the rules above
    2. A clear, concise title that describes what the chart is showing (max 70 characters)
    `;

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt: prompt,
    schema: z.object({
      chartType: z
        .enum([CHART_TYPES.BAR, CHART_TYPES.LINE, CHART_TYPES.PIE])
        .describe("The recommended chart type"),
      title: z
        .string()
        .max(70)
        .describe(
          "A clear, concise title describing what the chart shows in less than 70 characters"
        ),
    }),
  });

  return object;
}

export async function generateInsight(
  userQuestion: string,
  queryResult: RowData[]
) {
  // Limit the data sent to OpenAI to avoid token limits
  const MAX_ROWS = 50;
  const summarizedData =
    queryResult.length > MAX_ROWS
      ? {
          totalRows: queryResult.length,
          preview: queryResult.slice(0, MAX_ROWS),
          summary: {
            columns: Object.keys(queryResult[0]),
            uniqueValues: Object.keys(queryResult[0]).reduce(
              (acc, key) => {
                acc[key] = new Set(queryResult.map((row) => row[key])).size;
                return acc;
              },
              {} as Record<string, number>
            ),
          },
        }
      : queryResult;

  const prompt = `
    As a seasoned data analyst, answer the user's question based on the ${queryResult.length > MAX_ROWS ? "summarized" : "complete"} query results.
    
    User Question: ${userQuestion}
    ${
      queryResult.length > MAX_ROWS
        ? `Total Rows: ${queryResult.length}\nAnalyzing first ${MAX_ROWS} rows with column statistics.`
        : "Analyzing complete dataset."
    }
    Query Results: ${JSON.stringify(summarizedData)}

    Rules for insights:
    1. Be specific and quantitative when possible
    2. Focus on notable patterns, trends, or anomalies
    3. Keep each insight concise (max 100 words)
    4. Ensure insights are directly relevant to the user's question
    5. Use proper business terminology
    6. Revenue is always given in EURO
    7. Use Markdown syntax for key metrics using **bold text**
    8. Always wrap numbers, percentages, and key metrics in bold
    `;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    prompt: prompt,
    schema: z.object({
      insight: z
        .string()
        .describe("A concise, data-driven insight with markdown formatting"),
    }),
  });

  return object.insight;
}

export async function executeSQL(query: string) {
  console.log(
    `🔍 [executeSQL] Starting execution in environment: ${process.env.NODE_ENV || "development"}`
  );
  console.log(
    `🔍 [executeSQL] Runtime context: ${process.env.VERCEL_REGION || "local"}, Edge: ${typeof process.env.EDGE_RUNTIME !== "undefined" ? "Yes" : "No"}`
  );
  console.log(
    `🔍 [executeSQL] Query: ${query.substring(0, 100)}${query.length > 100 ? "..." : ""}`
  );

  try {
    console.log(
      `🔍 [executeSQL] About to execute query with prisma.$queryRawUnsafe`
    );
    const startTime = Date.now();
    const result = await prisma.$queryRawUnsafe(query);
    const duration = Date.now() - startTime;

    console.log(`✅ [executeSQL] Query executed successfully in ${duration}ms`);
    console.log(
      `✅ [executeSQL] Result type: ${typeof result}, isArray: ${Array.isArray(result)}`
    );
    if (Array.isArray(result)) {
      console.log(`✅ [executeSQL] Returned ${result.length} rows`);
      if (result.length > 0) {
        console.log(
          `✅ [executeSQL] First row keys: ${Object.keys(result[0]).join(", ")}`
        );
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ [executeSQL] Error executing query:`, error);
    console.error(
      `❌ [executeSQL] Error type: ${error instanceof Error ? error.constructor.name : "Unknown"}`
    );
    console.error(
      `❌ [executeSQL] Error message: ${error instanceof Error ? error.message : String(error)}`
    );

    const pgError: PostgresError = {
      code: "UNKNOWN_ERROR",
      message: "Failed to execute query",
    };

    const errorLog = {
      timestamp: new Date().toISOString(),
      query,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : "Unknown error type",
    };

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      pgError.code = error.code;
      pgError.message = error.message;
      if (error.meta && typeof error.meta.cause === "string") {
        pgError.detail = error.meta.cause;
      }
      Object.assign(errorLog, {
        prismaCode: error.code,
        prismaClientVersion: error.clientVersion,
        prismaTarget: error.meta,
      });

      console.error(`❌ [executeSQL] PrismaClientKnownRequestError details:`, {
        code: error.code,
        clientVersion: error.clientVersion,
        meta: error.meta,
      });
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      pgError.code = "VALIDATION_ERROR";
      pgError.message = error.message;
      console.error(`❌ [executeSQL] PrismaClientValidationError`);
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      pgError.code = "QUERY_ENGINE_ERROR";
      pgError.message = error.message;
      console.error(`❌ [executeSQL] PrismaClientRustPanicError`);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      pgError.code = "INITIALIZATION_ERROR";
      pgError.message = error.message;
      console.error(`❌ [executeSQL] PrismaClientInitializationError:`, {
        errorCode: error.errorCode,
        clientVersion: error.clientVersion,
      });
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      pgError.code = "UNKNOWN_REQUEST_ERROR";
      pgError.message = error.message;
      console.error(`❌ [executeSQL] PrismaClientUnknownRequestError`);
    }

    if (process.env.NODE_ENV === "production") {
      console.error("PostgreSQL Error:", JSON.stringify(errorLog, null, 2));
    } else {
      console.error("PostgreSQL Error:", errorLog);
    }

    return {
      success: false,
      error: pgError.message,
      code: pgError.code,
      details: pgError,
    };
  } finally {
    console.log(`🔍 [executeSQL] Disconnecting Prisma client`);
    try {
      await prisma.$disconnect();
      console.log(`✅ [executeSQL] Prisma client disconnected successfully`);
    } catch (disconnectError) {
      console.error(
        `❌ [executeSQL] Error disconnecting Prisma client:`,
        disconnectError
      );
    }
  }
}

export async function getQueries(userId?: string | null) {
  try {
    const pipeline = kv.pipeline();
    const queries: string[] = await kv.zrange(`user:query:${userId}`, 0, -1, {
      rev: true,
    });

    for (const query of queries) {
      pipeline.hgetall(query);
    }

    const results = await pipeline.exec();

    return results as Query[];
  } catch {
    return [];
  }
}

export async function getQuery(id: string, userId: string) {
  const query = await kv.hgetall<Query>(`query:${id}`);

  if (!query || (userId && query.userId !== userId)) {
    return null;
  }

  return query;
}

export async function saveQuery(query: Query) {
  const pipeline = kv.pipeline();
  pipeline.hmset(`query:${query.id}`, query);
  pipeline.zadd(`user:query:${query.userId}`, {
    score: Date.now(),
    member: `query:${query.id}`,
  });
  await pipeline.exec();
}

export async function removeQuery({ id, path }: { id: string; path: string }) {
  const uid = String(await kv.hget(`query:${id}`, "userId"));

  await kv.del(`query:${id}`);
  await kv.zrem(`user:query:${uid}`, `query:${id}`);

  revalidatePath("/");
  return revalidatePath(path);
}

export async function clearQueries() {
  const session = auth();

  const queries: string[] = await kv.zrange(
    `user:query:${session.userId}`,
    0,
    -1
  );
  if (!queries.length) {
    return redirect("/");
  }
  const pipeline = kv.pipeline();

  for (const query of queries) {
    pipeline.del(query);
    pipeline.zrem(`user:query:${session.userId}`, query);
  }

  await pipeline.exec();

  revalidatePath("/");
  return redirect("/");
}

export async function shareQuery(id: string) {
  const session = auth();

  if (!session?.userId) {
    return {
      error: "Unauthorized",
    };
  }

  const query = await kv.hgetall<Query>(`query:${id}`);

  if (!query || query.userId !== session.userId) {
    return {
      error: "Something went wrong",
    };
  }

  const payload = {
    ...query,
    sharePath: `/share/${query.id}`,
  };

  await kv.hmset(`query:${query.id}`, payload);

  return payload;
}

export async function getSharedQuery(id: string) {
  const query = await kv.hgetall<Query>(`query:${id}`);

  if (!query || !query.sharePath) {
    return null;
  }

  return query;
}
