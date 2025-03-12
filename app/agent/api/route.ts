import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import { BaseMessage } from "@langchain/core/messages";
import { getAuth } from "@clerk/nextjs/server";

import {
  convertVercelMessageToLangChainMessage,
  convertLangChainMessageToVercelMessage,
} from "@/lib/utils";
import { createDataAnalystAgent, type AgentState } from "../src";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Check authentication using getAuth for Edge runtime
    const { userId } = getAuth(req);

    // For development, we'll allow unauthenticated requests
    // In production, this should require authentication
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!userId && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for proper origin to prevent CSRF attacks
    const origin = req.headers.get("origin");
    // For development, we'll allow requests without an origin header (like direct API calls)
    // In production, this should be more restrictive
    if (origin) {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_BASE_URL || "",
        "https://www.tarohq.dev",
        "https://tarohq.dev",
      ].filter(Boolean);

      // Allow any localhost origin for development
      const isLocalhost =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:");

      if (!allowedOrigins.includes(origin) && !isLocalhost) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant"
      )
      .map(convertVercelMessageToLangChainMessage);

    // Get the current question from the last user message
    const currentQuestion =
      (messages.filter((msg: BaseMessage) => msg.getType() === "human").pop()
        ?.content as string) || "";

    // Create the agent
    const workflow = createDataAnalystAgent();

    // Initial state
    const initialState: AgentState = {
      messages,
      currentQuestion,
      sqlQuery: "",
      queryResults: [],
      chartRecommendation: undefined,
      insight: "",
      nodeVisitCounts: {},
      errors: [],
      retryCount: 0,
    };

    // Add a timeout protection to prevent long-running requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Request timed out after 1 minute")),
        60000
      );
    });

    // Return all messages including intermediate steps
    const result = (await Promise.race([
      workflow.invoke(initialState),
      timeoutPromise,
    ])) as AgentState;

    return NextResponse.json(
      {
        messages: result.messages.map(convertLangChainMessageToVercelMessage),
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Agent error:", e instanceof Error ? e.message : String(e));
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "An error occurred during processing",
        message:
          "There was a problem with the data analysis. Please try rephrasing your question or ask something simpler.",
      },
      { status: (e as { status?: number }).status ?? 500 }
    );
  }
}
