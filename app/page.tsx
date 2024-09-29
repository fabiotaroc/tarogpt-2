"use client";

import { useState } from "react";
import { generate } from "@/app/actions";
import { readStreamableValue } from "ai/rsc"
import { Button } from "@/components/ui/button"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>("");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button variant="outline" size="lg" onClick={async () => {
          const { output } = await generate("Why is the sky blue?");

          for await (const delta of readStreamableValue(output)) {
            setGeneration(
              (currentGeneration) => `${currentGeneration}${delta}`
            );
          }
        }}
      >
        Ask
      </Button>

      <div>{generation}</div>
    </div>
  );
}
