"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveQuery } from "@/app/actions";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { type Query } from "@/lib/types";
import { nanoid } from "nanoid";
import { useAuth } from "@clerk/nextjs";

export function QueryForm() {
  const { userId } = useAuth(); // Move useAuth to the top level of the component
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const id = nanoid();

      const queryData: Query = {
        id,
        userId: userId ?? "unknown", // Use userId from useAuth
        question: query,
        path: `/results/${id}`,
        createdAt: new Date(),
      };

      await saveQuery(queryData);
      console.log("Query saved with ID:", id);

      router.push(`/results/${id}`);
    } catch (error) {
      console.error("Error saving query:", error);
    } finally {
      setIsLoading(false);
    }
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
