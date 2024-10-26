import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/ui/codeblock";
import { QueryResultTable, RowData } from "@/components/ui/query-result-table";
import { Separator } from "@/components/ui/separator";

import { convertBigIntToString, formatDate } from "@/lib/utils";
import { executeSQL, getSharedQuery, translateSQL } from "@/app/actions";
import { FooterText } from "@/components/footer";

interface SharePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const query = await getSharedQuery(params.id);

  return {
    title: query?.question.slice(0, 50) ?? "Query",
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const query = await getSharedQuery(params.id);

  if (!query || !query?.sharePath) {
    notFound();
  }

  const translatedQuery = await translateSQL(query.question);
  const result = await executeSQL(translatedQuery);

  const queryResult = result.success
    ? (convertBigIntToString(result.data) as RowData[])
    : [];

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{query.question}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(query.createdAt)}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-8 flex flex-col w-full overflow-auto transition-all ease-in-out peer-[[data-state=open]]:lg:pl-[300px] peer-[[data-state=open]]:xl:pl-[350px]">
          <h2 className="text-2xl font-bold">SQL Query</h2>
          <CodeBlock value={translatedQuery} />
          <Separator />
          <h2 className="text-2xl font-bold">Table</h2>
          <QueryResultTable data={queryResult} />
        </div>
      </div>
      <FooterText className="py-8" />
    </>
  );
}
