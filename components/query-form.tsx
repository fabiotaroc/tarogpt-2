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
import { toast } from "sonner";
import { EXAMPLE_QUESTIONS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function QueryForm() {
  const { userId } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const id = nanoid();

    // Create query data
    const queryData: Query = {
      id,
      userId: userId ?? "unknown",
      question: query,
      path: `/results/${id}`,
      createdAt: new Date(),
    };

    try {
      await saveQuery(queryData);
      router.push(`/results/${id}`);
    } catch (error) {
      console.error("Error saving query:", error);
      toast.error("Failed to save query");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = async (question: string) => {
    if (isLoading) return;
    
    setQuery(question);
    setIsLoading(true);
    const id = nanoid();

    const queryData: Query = {
      id,
      userId: userId ?? "unknown",
      question,
      path: `/results/${id}`,
      createdAt: new Date(),
    };

    try {
      await saveQuery(queryData);
      router.push(`/results/${id}`);
    } catch (error) {
      console.error("Error saving query:", error);
      toast.error("Failed to save query");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-screen-md">
      <h2 className="text-4xl font-bold mb-8 text-center">
        Ask Questions About Your Ecommerce Data
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
          {isLoading ? "Processing..." : "Ask Question"}
        </Button>
      </form>
      
      {/* example questions */}
      <div className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_QUESTIONS.map((example) => (
            <Card
              key={example.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleExampleClick(example.question)}
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {example.question}
                </CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
