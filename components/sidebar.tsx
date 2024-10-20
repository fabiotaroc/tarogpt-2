"use client";

import * as React from "react";

import { useSidebar } from "@/lib/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function Sidebar({ className, children }: React.ComponentProps<"div">) {
  const { isSidebarOpen, isLoading } = useSidebar();

  return (
    <div
      data-state={isSidebarOpen && !isLoading ? "open" : "closed"}
      className={cn(className, "h-full flex-col dark:bg-zinc-950")}
    >
      {children}
    </div>
  );
}
