"use client";

import { QueryForm } from "@/components/query-form";
import { FooterText } from "@/components/footer";
import { InfoBox } from "@/components/info-box";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <InfoBox />
      <QueryForm />
      <footer className="mt-auto">
        <FooterText />
      </footer>
    </main>
  );
}
