"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BarChartProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  dataKey: string;
}

const chartConfig = {
  desktop: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartComponent({ data, xAxisKey, dataKey }: BarChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    [dataKey]: typeof item[dataKey] === 'number' 
      ? Number(item[dataKey].toFixed(2))
      : item[dataKey]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Results Visualization</CardTitle>
        <CardDescription>Data Analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={formattedData}
            margin={{
              top: 30,
              right: 50,
              left: 50,
              bottom: 150,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={30}
              axisLine={false}
              interval={0}
              tick={{ 
                angle: -45,
                textAnchor: 'end',
                fontSize: 10,
              }}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={dataKey} fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => value.toFixed(2)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Visualization of query results
        </div>
      </CardFooter>
    </Card>
  );
}
