"use server";

import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { tableSchema } from "@/lib/ai-config";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

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

interface SessionData {
  queries: string[];
}

export async function getSession(): Promise<SessionData> {
  const { userId } = auth();
  const sessionData = await kv.get<SessionData>(`session:${userId}`);
  return sessionData || { queries: [] };
}

export async function updateSession(data: Partial<SessionData>): Promise<void> {
  const { userId } = auth();
  const currentSession = await getSession();
  const updatedSession = { ...currentSession, ...data };
  await kv.set(`session:${userId}`, updatedSession);
}

export async function addQueryToSession(query: string): Promise<void> {
  const { userId } = auth();
  const session = await getSession();
  const updatedQueries = [query, ...session.queries];
  await kv.set(`session:${userId}`, { queries: updatedQueries });
}
