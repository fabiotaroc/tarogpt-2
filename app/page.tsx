"use client";

import { QueryForm } from "@/components/query-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">Ask Questions About Your Data</h1>
      <QueryForm />
    </main>
  );
}
