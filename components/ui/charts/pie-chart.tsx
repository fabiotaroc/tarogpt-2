"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PieChartProps {
  data: Array<Record<string, any>>;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)', 
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

export default function PieChartComponent({ data }: PieChartProps) {
  const firstTwoColumns = Object.keys(data[0]).slice(0, 2);
  const [labelKey, valueKey] = firstTwoColumns;

  const formattedData = data.map(item => ({
    ...item,
    [valueKey]: typeof item[valueKey] === 'number'
      ? Number(item[valueKey].toFixed(2))
      : item[valueKey]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Results Visualization</CardTitle>
        <CardDescription>Data Analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                dataKey={valueKey}
                nameKey={labelKey}
                cx="50%"
                cy="50%"
                label={({
                  cx,
                  cy,
                  midAngle,
                  outerRadius,
                  value,
                  name
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      className="fill-foreground"
                      fontSize={12}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {`${name}: ${Number(value).toFixed(2)}`}
                    </text>
                  );
                }}
              >
                {formattedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 