"use server";

import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";
import { generateObject } from "ai";
import { tableSchema } from "@/lib/ai-config";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { type Query } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

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
