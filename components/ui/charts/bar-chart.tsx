"use client";

import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { nanoid } from "nanoid";
import React from "react";

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

import { ChartCopyButton } from "../chart-copy-button";

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

export default function BarChart({ data, xAxisKey, dataKey }: BarChartProps) {
  const chartId = React.useMemo(() => `chart-${nanoid()}`, []);

  const formattedData = data.map(item => ({
    ...item,
    [dataKey]: typeof item[dataKey] === 'number' 
      ? Number(item[dataKey].toFixed(2))
      : typeof item[dataKey] === 'string'
        ? parseFloat(item[dataKey]) || 0
        : 0,
    [xAxisKey]: String(item[xAxisKey])
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query Results Visualization</CardTitle>
            <CardDescription>Data Analysis</CardDescription>
          </div>
          <ChartCopyButton chartId={chartId} />
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} className="relative bg-background">
          <ChartContainer config={chartConfig}>
            <RechartsBarChart
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
                tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={16}
                      textAnchor="end"
                      transform={`rotate(-45 ${x} ${y})`}
                      fontSize={10}
                    >
                      {payload.value}
                    </text>
                  );
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
            </RechartsBarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Visualization of query results
        </div>
      </CardFooter>
    </Card>
  );
}
