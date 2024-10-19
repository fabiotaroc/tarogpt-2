"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { translateSQL} from "@/app/actions";

export function QueryForm() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const translatedQuery = await translateSQL(query);
      router.push(`/results?sql=${encodeURIComponent(translatedQuery)}`);
    } catch (error) {
      console.error("Error translating query:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-sm items-center space-y-2">
      <Input
        type="text"
        placeholder="Ask a question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-foreground bg-background"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Translating..." : "Translate and Execute Query"}
      </Button>
    </form>
  );
}
