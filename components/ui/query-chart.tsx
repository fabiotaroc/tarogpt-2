"use client";

import { lazy, Suspense } from "react";
import { ChartType, CHART_TYPES } from "@/lib/chart-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load chart components
const BarChart = lazy(() => import("@/components/ui/charts/bar-chart"));
const LineChart = lazy(() => import("@/components/ui/charts/line-chart"));
const PieChart = lazy(() => import("@/components/ui/charts/pie-chart"));
const AreaChart = lazy(() => import("@/components/ui/charts/area-chart"));

interface QueryChartProps {
  data: any[];
  chartType: ChartType;
  reasoning: string;
}

const ChartComponents = {
  [CHART_TYPES.BAR]: BarChart,
  [CHART_TYPES.LINE]: LineChart,
  [CHART_TYPES.PIE]: PieChart,
  [CHART_TYPES.AREA]: AreaChart,
} as const;

function ChartSkeleton() {
  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

export function QueryChart({ data, chartType, reasoning }: QueryChartProps) {
  const ChartComponent = ChartComponents[chartType];

  if (!ChartComponent) {
    return <div>Unsupported chart type: {chartType}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visualization</span>
          <span className="text-sm font-normal text-muted-foreground">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{reasoning}</p>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton />}>
          <ChartComponent data={data} />
        </Suspense>
      </CardContent>
    </Card>
  );
} 