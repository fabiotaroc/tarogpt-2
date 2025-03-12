"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const pathname = usePathname();
  const isAgentMode = pathname.startsWith("/agent");

  return (
    <div className="flex rounded-md overflow-hidden border border-input">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={`rounded-none px-3 ${
          !isAgentMode
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "hover:bg-muted"
        }`}
      >
        <Link href="/">Question</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={`rounded-none px-3 ${
          isAgentMode
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "hover:bg-muted"
        }`}
      >
        <Link href="/agent" className="flex items-center gap-1.5">
          Agent
          <span className="text-[10px] font-medium bg-orange-500/20 text-orange-500 px-1 rounded">
            BETA
          </span>
        </Link>
      </Button>
    </div>
  );
}
