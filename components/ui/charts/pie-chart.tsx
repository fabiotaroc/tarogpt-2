"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";
import { nanoid } from "nanoid";
import React from "react";
import { ChartCopyButton } from "../chart-copy-button";
import { RowData } from "@/lib/types";

interface PieChartProps {
  data: RowData[];
  title: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function PieChartComponent({ data, title }: PieChartProps) {
  const chartId = React.useMemo(() => `chart-${nanoid()}`, []);

  const firstTwoColumns = Object.keys(data[0]).slice(0, 2);
  const [labelKey, valueKey] = firstTwoColumns;

  const formattedData = data.map((item) => ({
    ...item,
    [valueKey]:
      typeof item[valueKey] === "number"
        ? Number(item[valueKey].toFixed(2))
        : typeof item[valueKey] === "string"
          ? parseFloat(item[valueKey]) || 0
          : 0,
  }));

  const total = formattedData.reduce(
    (sum, item) => sum + Number(item[valueKey]),
    0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Pie chart</CardDescription>
          </div>
          <ChartCopyButton chartId={chartId} />
        </div>
      </CardHeader>
      <CardContent>
        <div id={chartId} className="relative bg-background">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  dataKey={valueKey}
                  nameKey={labelKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  innerRadius={75}
                  paddingAngle={2}
                  label={({ cx, cy, midAngle, outerRadius, value, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 1.25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const percentage = ((value / total) * 100).toFixed(1);

                    return (
                      <text
                        x={x}
                        y={y}
                        className="fill-foreground"
                        fontSize={12}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${name} (${percentage}%)`}
                      </text>
                    );
                  }}
                >
                  {formattedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="stroke-background hover:opacity-80 transition-opacity"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    const data = payload[0].payload;
                    const value = Number(data[valueKey]);
                    const percentage = ((value / total) * 100).toFixed(1);

                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {labelKey}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data[labelKey]}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Value
                            </span>
                            <span className="font-bold">
                              {value.toFixed(2)} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
