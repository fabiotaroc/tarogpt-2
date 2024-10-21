"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { translateSQL } from "@/app/actions";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export function QueryForm() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    translateSQL(query)
      .then((translatedQuery) => {
        router.push(
          `/results?sql=${encodeURIComponent(translatedQuery)}&question=${encodeURIComponent(query)}`
        );
      })
      .catch((error) => {
        console.error("Error translating query:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full max-w-screen-md">
      <h2 className="text-4xl font-bold mb-8 text-center">
        Ask Questions About Your Data
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full items-center space-y-6"
      >
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Enter your question here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-lg text-foreground bg-background border-2 border-primary shadow-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-in-out py-6 px-4 pl-12 rounded-lg"
          />
        </div>
        <Button
          variant="default"
          size="lg"
          type="submit"
          disabled={isLoading}
          className="w-full max-w-md text-lg py-6"
        >
          {isLoading ? "Translating..." : "Translate and Execute Query"}
        </Button>
      </form>
    </div>
  );
}
