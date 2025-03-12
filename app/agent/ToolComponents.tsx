"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { SQLCodeDisplay } from "@/components/ui/sql-code-display";
import { QueryErrorCard } from "@/components/ui/query-error-card";
import { QueryResultTable } from "@/components/ui/query-result-table";
import { QueryChart } from "@/components/ui/query-chart";
import { InsightCard } from "@/components/ui/insight-card";
import { RowData, ChartRecommendation } from "@/lib/types";

// SQL Translation Tool
type TranslateSQLArgs = {
  question: string;
  previousQuery?: string;
  previousError?: { code: string; message: string };
};

export const TranslateSQLTool = makeAssistantToolUI<TranslateSQLArgs, string>({
  toolName: "translate_sql",
  render: function TranslateSQLUI({ result }) {
    return <SQLCodeDisplay sql={result ?? ""} />;
  },
});

// SQL Execution Tool
type ExecuteSQLArgs = {
  query: string;
};

type ExecuteSQLResult = {
  success: boolean;
  data?: RowData[];
  error?: string;
};

export const ExecuteSQLTool = makeAssistantToolUI<ExecuteSQLArgs, string>({
  toolName: "execute_sql",
  render: function ExecuteSQLUI({ result }) {
    let resultObj: ExecuteSQLResult;
    try {
      resultObj = JSON.parse(result ?? "");
    } catch (e) {
      return <QueryErrorCard error={result ?? "Unknown error"} />;
    }

    if (!resultObj.success) {
      return <QueryErrorCard error={resultObj.error || "Unknown error"} />;
    }

    return <QueryResultTable data={resultObj.data!} />;
  },
});

// Chart Recommendation Tool
type RecommendChartArgs = {
  question: string;
  query: string;
  rowCount: number;
};

export const RecommendChartTool = makeAssistantToolUI<
  RecommendChartArgs,
  string
>({
  toolName: "recommend_chart",
  render: function RecommendChartUI({ result, args }) {
    let chartRec: ChartRecommendation;
    try {
      chartRec = JSON.parse(result ?? "{}");
    } catch (e) {
      return (
        <p className="text-red-500">Failed to parse chart recommendation</p>
      );
    }

    return (
      <QueryChart
        data={args.data as RowData[]}
        chartType={chartRec.chartType}
        title={chartRec.title}
      />
    );
  },
});

// Insight Generation Tool
type GenerateInsightArgs = {
  question: string;
  data: Record<string, string | number | boolean | null>[]; // Serializable version of RowData
};

export const GenerateInsightTool = makeAssistantToolUI<
  GenerateInsightArgs,
  string
>({
  toolName: "generate_insight",
  render: function GenerateInsightUI({ result }) {
    return <InsightCard insight={result ?? ""} />;
  },
});
