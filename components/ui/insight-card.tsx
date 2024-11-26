"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconCheck, IconCopy } from "@/components/ui/icons";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

interface InsightCardProps {
  insight: string;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(insight);
  };

  return (
    <Card>
      <CardContent className="pt-6 prose prose-zinc dark:prose-invert relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 mb-4 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={onCopy}
        >
          {isCopied ? <IconCheck /> : <IconCopy />}
          <span className="sr-only">Copy insight</span>
        </Button>
        <MemoizedReactMarkdown>{insight}</MemoizedReactMarkdown>
      </CardContent>
    </Card>
  );
} 