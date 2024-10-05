"use server";

import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { tableSchema } from "@/lib/ai-config";
import { z } from "zod";

export async function translateSQL(userQuestion: string) {
  const prompt = `
    You are an expert in PostgreSQL and have intimate knowledge of this table schema: ${tableSchema}

    Read the user question: ${userQuestion}, reason about what to extract from the database to best answer the user question, 
    and output a valid PostgreSQL SELECT query.
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

export async function executeSQL(query: string) {
  try {
    console.log("Connecting to database...");
    const result = await prisma.$queryRawUnsafe(query);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error executing SQL query:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute query",
    };
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}
