import { Suspense } from "react";
import { QueryResults } from "@/components/query-results";
import LoadingResults from "./loading";

export default function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<LoadingResults />}>
      <QueryResults queryId={params.id} />
    </Suspense>
  );
}
