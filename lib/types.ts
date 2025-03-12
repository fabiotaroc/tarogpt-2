export interface Query extends Record<string, unknown> {
  id: string;
  userId: string;
  question: string;
  path: string;
  createdAt: Date;
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

export interface AuthResult {
  type: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  salt: string;
}

export interface PostgresError {
  code: string;
  message: string;
  detail?: string;
  schema?: string;
  table?: string;
  constraint?: string;
}

export type CellValue = string | number | Date | bigint | boolean | null | undefined;

export type RowData = Record<string, CellValue>;

export const CHART_TYPES = {
  BAR: "bar",
  LINE: "line",
  PIE: "pie",
  AREA: "area",
} as const;

export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];

export interface ChartRecommendation {
  chartType: ChartType;
  title: string;
} 