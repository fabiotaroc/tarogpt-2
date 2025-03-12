"use client";

import { ChatWindow } from "@/components/chat/chat-window";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <ChatWindow
        endpoint="agent/api"
        emptyStateComponent={<div></div>}
        placeholder="Ask me anything..."
      />
    </div>
  );
}
