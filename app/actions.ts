"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { prisma } from "@/lib/prisma";

export async function generate(input: string) {
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}

export async function executeSQLQuery(query: string) {
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