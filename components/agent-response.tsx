"use client";

import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { QueryChart } from "@/components/ui/query-chart";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "@/components/ui/insight-card";
import { formatDate } from "@/lib/utils";

interface AgentResponseProps {
  responseData: string;
}

export function AgentResponse({ responseData }: AgentResponseProps) {
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(responseData);
      setParsedData(data);
      setError(null);
    } catch (err) {
      console.error("Error parsing agent response:", err);
      setError("Failed to parse agent response");
    }
  }, [responseData]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-muted-foreground mt-2">
            Raw response: {responseData}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!parsedData) {
    return <div>Loading...</div>;
  }

  const { question, translatedQuery, result, chartRecommendation, insight } =
    parsedData;

  return (
    <div className="space-y-4 p-8 flex flex-col w-full min-h-full overflow-auto">
      {/* Question Section */}
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          &ldquo;{question}&rdquo;
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* SQL Query Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">SQL Query</h2>
        <CodeBlock value={translatedQuery} />
      </section>

      <Separator />

      {/* Results Table Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Results</h2>
        {result.data.length > 0 ? (
          <QueryResultTable data={result.data} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No results found for this query.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Chart Section */}
      {chartRecommendation && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Chart</h2>
            <QueryChart
              data={result.data}
              chartType={chartRecommendation.chartType}
              title={chartRecommendation.title}
            />
          </section>
        </>
      )}

      {/* Insight Section */}
      {insight && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Key Insights
            </h2>
            <InsightCard insight={insight} />
          </section>
        </>
      )}

      {/* Error Message */}
      {result && !result.success && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Executing Query
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
