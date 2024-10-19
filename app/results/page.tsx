import { executeSQL } from "@/app/actions";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable, RowData } from "@/components/ui/query-result-table";
import { convertBigIntToString } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default async function QueryPage({
  searchParams,
}: {
  searchParams: { sql: string };
}) {
  const { sql } = searchParams;
  const result = await executeSQL(sql);

  const queryResult = result.success
    ? (convertBigIntToString(result.data) as RowData[])
    : [];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">SQL Query</h2>
      <CodeBlock value={sql} />
      <Separator />
      <h2 className="text-2xl font-bold">Table</h2>
      <QueryResultTable data={queryResult} />
    </div>
  );
}
