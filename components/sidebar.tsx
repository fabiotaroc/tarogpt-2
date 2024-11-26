"use client";

import * as React from "react";

import { useSidebar } from "@/lib/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { SidebarToggle } from "@/components/sidebar-toggle";

export function Sidebar({ className, children }: React.ComponentProps<"div">) {
  const { isSidebarOpen, isLoading } = useSidebar();

  return (
    <div
      data-state={isSidebarOpen && !isLoading ? "open" : "closed"}
      className={cn(
        className,
        "flex flex-col h-full dark:bg-zinc-950"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Query History</h2>
        <SidebarToggle />
      </div>
      {children}
    </div>
  );
}
