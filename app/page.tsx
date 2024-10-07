"use client";

import { useState } from "react";
import { executeSQL, translateSQL } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/codeblock";
import { convertBigIntToString } from "@/lib/utils";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { Input } from "@/components/ui/input";
import { FooterText } from "@/components/footer";

export default function Home() {
  const [query, setQuery] = useState("");
  const [sql, setSQL] = useState("");
  const [queryResult, setQueryResult] = useState<any[]>([]);

  const handleTranslate = async () => {
    try {
      const result = await translateSQL(query);
      setSQL(convertBigIntToString(result));
    } catch (error) {
      console.error("Error in handleTranslate:", error);
    }
  };

  const handleExecute = async () => {
    const result = await executeSQL(sql);
    setQueryResult(result.data as any[]);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Input
          type="text"
          placeholder="Enter SQL query"
          className="w-full bg-background text-foreground"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="default"
          size="lg"
          onClick={() => {
            handleTranslate();
          }}
        >
          Translate Query
        </Button>
        <CodeBlock value={sql} />
        <Button variant="default" size="lg" onClick={handleExecute}>
          Execute SQL
        </Button>
        <div className="w-full bg-card rounded-md shadow-sm p-4">
          <QueryResultTable data={queryResult} />
        </div>
      </div>
      <div className="bottom-0 left-0 right-0 p-3 bg-background">
        <FooterText />
      </div>
    </>
  );
}
