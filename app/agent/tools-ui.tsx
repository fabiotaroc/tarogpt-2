import { QueryResultTable } from "@/components/ui/query-result-table";
import { QueryChart } from "@/components/ui/query-chart";
import { InsightCard } from "@/components/ui/insight-card";
import { CodeBlock } from "@/components/ui/codeblock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { maskSensitiveData } from "@/lib/utils";
import { RowData } from "@/lib/types";

export function SQLCodeBlockUI({ result }: { result: string }) {
  return <CodeBlock value={maskSensitiveData(result)} />;
}

export function ResultTableUI({ result }: { result: string }) {
  const parsedResult = JSON.parse(result);

  if (!parsedResult.success) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Executing Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{parsedResult.error}</p>
        </CardContent>
      </Card>
    );
  }

  return <QueryResultTable data={parsedResult.data as RowData[]} />;
};

export function ChartUI({
  result,
  data,
}: {
  result: string;
  data: RowData[];
}) {
  const { chartType, title } = JSON.parse(result);
  return <QueryChart data={data} chartType={chartType} title={title} />;
}

export function InsightUI({ result }: { result: string }) {
  return <InsightCard insight={result} />;
}
