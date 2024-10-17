"use client";

import { useState } from "react";
import { executeSQL, translateSQL } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/codeblock";
import { convertBigIntToString } from "@/lib/utils";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { Input } from "@/components/ui/input";
import { FooterText } from "@/components/footer";

// Define a type for possible cell values
type CellValue = string | number | Date | bigint | boolean | null | undefined;

// Define a type for the row data
type RowData = Record<string, CellValue>;

export default function Home() {
  const [query, setQuery] = useState("");
  const [sql, setSQL] = useState("");
  const [queryResult, setQueryResult] = useState<RowData[]>([]);

  const handleTranslate = async () => {
    try {
      const result = await translateSQL(query);
      setSQL(result);
    } catch (error) {
      console.error("Error in handleTranslate:", error);
    }
  };

  const handleExecute = async () => {
    try {
      const result = await executeSQL(sql);
      if (result.success) {
        setQueryResult(convertBigIntToString(result.data) as RowData[]);
      } else {
        console.error("Error executing SQL:", result.error);
        // You might want to set an error state here and display it to the user
      }
    } catch (error) {
      console.error("Error in handleExecute:", error);
    }
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
          onClick={handleTranslate}
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
