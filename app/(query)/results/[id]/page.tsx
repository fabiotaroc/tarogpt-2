import {
  getQuery,
  executeSQL,
  translateSQL,
  getRecommendedChartType,
} from "@/app/actions";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { RowData } from "@/lib/types";
import {
  convertBigIntToString,
  formatDate,
  maskSensitiveData,
} from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs/server";
import { QueryChart } from "@/components/ui/query-chart";

const isDataSuitableForChart = (data: RowData[]): boolean => {
  if (data.length <= 1) return false;

  // Need at least 2 columns
  const firstRow = data[0];
  if (!firstRow || Object.keys(firstRow).length < 2) return false;

  // Check if second column has numeric values
  const secondColumn = Object.keys(firstRow)[1];
  return data.some((row) => {
    const value = row[secondColumn];
    return (
      typeof value === "number" ||
      (typeof value === "string" && !isNaN(parseFloat(value)))
    );
  });
};

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = auth();
  const queryData = await getQuery(params.id, userId ?? "unknown");

  if (!queryData) {
    return <div>Query not found or you do not have access to it.</div>;
  }

  const translatedQuery = await translateSQL(queryData.question);
  const maskedQuery = maskSensitiveData(translatedQuery);
  const result = await executeSQL(translatedQuery);
  const queryResult = result.success
    ? (convertBigIntToString(result.data) as RowData[])
    : [];

  const canShowChart = isDataSuitableForChart(queryResult);

  const chartRecommendation = canShowChart
    ? await getRecommendedChartType(
        queryData.question,
        translatedQuery,
        queryResult.length
      )
    : null;

  return (
    <div className="space-y-4 p-8 flex flex-col w-full min-h-full overflow-auto transition-all ease-in-out peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[350px]">
      <div className="flex flex-col items-center justify-between">
        <h1 className="text-2xl font-bold">
          &ldquo;{queryData.question}&rdquo;
        </h1>
        <div className="text-sm text-muted-foreground">
          {formatDate(queryData.createdAt)}
        </div>
      </div>
      <h2 className="text-xl font-medium text-muted-foreground">SQL Query</h2>
      <CodeBlock value={maskedQuery} />
      <Separator />
      <h2 className="text-xl font-medium text-muted-foreground">Table</h2>
      <QueryResultTable data={queryResult} />
      {canShowChart && chartRecommendation && (
        <>
          <Separator />
          <h2 className="text-xl font-medium text-muted-foreground">Chart</h2>
          <div className="w-full max-w-6xl mx-auto">
            <QueryChart
              data={queryResult}
              chartType={chartRecommendation.chartType}
              title={chartRecommendation.title}
            />
          </div>
        </>
      )}
    </div>
  );
}
