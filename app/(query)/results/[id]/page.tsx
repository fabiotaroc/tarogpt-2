import { getQuery, executeSQL, translateSQL } from "@/app/actions";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable, RowData } from "@/components/ui/query-result-table";
import { convertBigIntToString } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs/server";

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = auth();
  const queryData = await getQuery(params.id, userId ?? "unknown");
  console.log("Query Data:", queryData);

  if (!queryData) {
    return <div>Query not found or you do not have access to it.</div>;
  }
  
  const translatedQuery = await translateSQL(queryData.question);
  const result = await executeSQL(translatedQuery);

  const queryResult = result.success
    ? (convertBigIntToString(result.data) as RowData[])
    : [];

  return (
    <div className="space-y-4 p-8 flex flex-col w-full overflow-auto transition-all ease-in-out peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[350px]">
      <h2 className="text-2xl font-bold">SQL Query</h2>
      <CodeBlock value={translatedQuery} />
      <Separator />
      <h2 className="text-2xl font-bold">Table</h2>
      <QueryResultTable data={queryResult} />
    </div>
  );
}
