"use client";

import { lazy, Suspense } from "react";
import { ChartType, CHART_TYPES } from "@/lib/chart-types";
import { Skeleton } from "@/components/ui/skeleton";
import { RowData } from "@/lib/types";

const BarChart = lazy(() => import("@/components/ui/charts/bar-chart"));
const LineChart = lazy(() => import("@/components/ui/charts/line-chart"));
const PieChart = lazy(() => import("@/components/ui/charts/pie-chart"));

interface QueryChartProps {
  data: RowData[];
  chartType: ChartType;
  title: string;
}

const ChartComponents = {
  [CHART_TYPES.BAR]: BarChart,
  [CHART_TYPES.LINE]: LineChart,
  [CHART_TYPES.PIE]: PieChart,
} as const;

function ChartSkeleton() {
  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
export function QueryChart({ data, chartType, title }: QueryChartProps) {
  const ChartComponent = ChartComponents[chartType as keyof typeof ChartComponents];
  const firstTwoColumns = data.length > 0 ? Object.keys(data[0]).slice(0, 2) : [];
  const [xAxisKey, dataKey] = firstTwoColumns;

  return (
    <div className="w-full">
      <Suspense fallback={<ChartSkeleton />}>
        {firstTwoColumns.length >= 2 && (
          <ChartComponent 
            data={data} 
            xAxisKey={xAxisKey} 
            dataKey={dataKey} 
            title={title}
          />
        )}
      </Suspense>
    </div>
  );
} 