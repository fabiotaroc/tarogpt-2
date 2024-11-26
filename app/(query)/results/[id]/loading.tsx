import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function LoadingResults() {
  return (
    <div className="space-y-4 p-8 flex flex-col w-full min-h-full overflow-auto">
      <div className="flex flex-col items-center justify-between">
        <Skeleton className="h-8 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      
      <h2 className="text-xl font-semibold tracking-tight">SQL Query</h2>
      <Skeleton className="h-32 w-full" />
      
      <Separator />
      
      <h2 className="text-xl font-semibold tracking-tight">Table</h2>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      
      <Separator />
      
      <h2 className="text-xl font-semibold tracking-tight">Chart</h2>
      <Skeleton className="h-[350px] w-full" />
      
      <Separator />
      
      <h2 className="text-xl font-semibold tracking-tight">Key Insights</h2>
      <Skeleton className="h-24 w-full" />
    </div>
  );
} 