"use client";

import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip
} from "@/components/ui/chart";

import { formatDate } from "@/lib/utils";
import { ChartCopyButton } from "../chart-copy-button";
import { nanoid } from "nanoid";
import React from "react";
import { RowData } from "@/lib/types";

interface LineChartProps {
  data: RowData[];
  xAxisKey: string;
  dataKey: string;
  title: string;
}

const chartConfig = {
  desktop: {
    label: "Value",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function LineChart({ data, xAxisKey, dataKey, title }: LineChartProps) {
  const chartId = `line-chart-${nanoid()}`;

  const formattedData = data.map(item => ({
    ...item,
    [xAxisKey]: (item[xAxisKey] instanceof Date || 
      (item[xAxisKey] != null && !isNaN(new Date(item[xAxisKey] as string | number | Date).getTime())))
      ? new Date(item[xAxisKey] as string | number | Date)
      : item[xAxisKey],
    [dataKey]: typeof item[dataKey] === 'number' 
      ? Number(item[dataKey].toFixed(2))
      : typeof item[dataKey] === 'string'
        ? parseFloat(item[dataKey]) || 0
        : 0
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Line chart</CardDescription>
          </div>
          <ChartCopyButton chartId={chartId} />
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} className="relative bg-background">
          <ChartContainer config={chartConfig}>
            <RechartsLineChart
              data={formattedData}
              margin={{
                top: 30,
                right: 50,
                left: 50,
                bottom: 150,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={30}
                axisLine={false}
                interval={0}
                tick={(props) => (
                  <text
                    transform={`rotate(-45 ${props.x} ${props.y})`}
                    x={props.x}
                    y={props.y}
                    textAnchor="end"
                    fontSize={10}
                    dy={20}
                  >
                    {props.payload.value instanceof Date 
                      ? formatDate(props.payload.value)
                      : props.payload.value}
                  </text>
                )}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload[xAxisKey] instanceof Date
                              ? formatDate(payload[0].payload[xAxisKey])
                              : payload[0].payload[xAxisKey]}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Value
                          </span>
                          <span className="font-bold">
                            {Number(payload[0].value).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={{ fill: "var(--color-desktop)" }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
} 