"use client";

import { lazy, Suspense } from "react";
import { ChartType, CHART_TYPES } from "@/lib/chart-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RowData } from "@/lib/types";

// Lazy load chart components
const BarChart = lazy(() => import("@/components/ui/charts/bar-chart"));
const LineChart = lazy(() => import("@/components/ui/charts/line-chart"));
const PieChart = lazy(() => import("@/components/ui/charts/pie-chart"));

interface QueryChartProps {
  data: RowData[];
  chartType: ChartType;
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
export function QueryChart({ data, chartType }: QueryChartProps) {
  const ChartComponent = ChartComponents[chartType as keyof typeof ChartComponents];
  const firstTwoColumns = data.length > 0 ? Object.keys(data[0]).slice(0, 2) : [];
  const [xAxisKey, dataKey] = firstTwoColumns;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visualisation</span>
          <span className="text-sm font-normal text-muted-foreground">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton />}>
          {firstTwoColumns.length >= 2 && (
            <ChartComponent 
              data={data} 
              xAxisKey={xAxisKey} 
              dataKey={dataKey} 
            />
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
} 