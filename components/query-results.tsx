import {
  getQuery,
  executeSQL,
  translateSQL,
  getRecommendedChartType,
  generateInsight,
} from "@/app/actions";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { QueryChart } from "@/components/ui/query-chart";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs/server";
import { isDataSuitableForChart } from "@/lib/utils";
import { RowData, PostgresError } from "@/lib/types";
import { convertBigIntToString } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { InsightCard } from "@/components/ui/insight-card";
import { maskSensitiveData } from "@/lib/utils";
import { QueryNotFoundCard } from "./ui/query-not-found-card";

export async function QueryResults({ queryId }: { queryId: string }) {
  const { userId } = auth();
  const queryData = await getQuery(queryId, userId ?? "unknown");

  if (!queryData) {
    return <QueryNotFoundCard />;
  }

  // Maximum number of retries for SQL translation
  const MAX_RETRIES = 3;
  let currentTry = 0;
  let translatedQuery: string | undefined = undefined;
  let result: Awaited<ReturnType<typeof executeSQL>> | null = null;
  let previousError: PostgresError | undefined = undefined;

  while (currentTry < MAX_RETRIES) {
    const translation = await translateSQL(
      queryData.question,
      translatedQuery,
      previousError
    );

    translatedQuery = translation;
    result = await executeSQL(translation);

    if (result.success) {
      break;
    }

    previousError = result.details;
    currentTry++;

    // If we've hit max retries, break to show the last error
    if (currentTry === MAX_RETRIES) {
      break;
    }
  }

  const maskedQuery = maskSensitiveData(translatedQuery ?? '');
  const queryResult = result?.success
    ? (convertBigIntToString(result.data) as RowData[])
    : [];

  const canShowChart = isDataSuitableForChart(queryResult);

  // Parallel fetch chart recommendation and insight
  const [chartRecommendation, insight] = await Promise.all([
    canShowChart
      ? getRecommendedChartType(
          queryData.question,
          translatedQuery ?? '',
          queryResult.length
        )
      : Promise.resolve(null),
    queryResult.length > 0
      ? generateInsight(queryData.question, queryResult)
      : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-4 p-8 flex flex-col w-full min-h-full overflow-auto transition-all ease-in-out peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[350px]">
      {/* Question Section */}
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          &ldquo;{queryData.question}&rdquo;
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(queryData.createdAt)}
        </p>
      </div>

      {/* SQL Query Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">SQL Query</h2>
        <CodeBlock value={maskedQuery} />
      </section>

      <Separator />

      {/* Results Table Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Results</h2>
        {queryResult.length > 0 ? (
          <QueryResultTable data={queryResult} />
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
      {canShowChart && chartRecommendation && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Chart</h2>
            <QueryChart
              data={queryResult}
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
