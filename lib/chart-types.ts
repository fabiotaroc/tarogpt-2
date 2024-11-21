export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  AREA: 'area',
} as const;

export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];

export interface ChartRecommendation {
  chartType: ChartType;
  title: string;
} 