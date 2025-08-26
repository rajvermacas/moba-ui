/**
 * TypeScript types for visualization system
 */

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'table';

export interface VisualizationSpec {
  chart_type: ChartType;
  recommended: boolean;
  alternatives: ChartType[];
  column_types: Record<string, 'numeric' | 'categorical' | 'temporal' | 'text'>;
  config: ChartConfiguration;
  data: Record<string, any>[];
  metadata?: {
    title?: string;
    description?: string;
    insights?: string[];
    dataSource?: string;
    generatedAt?: string;
    row_count?: number;
    column_count?: number;
    query?: string;
  };
}

export interface ChartConfiguration {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig | AxisConfig[];
  series?: SeriesConfig[];
  colors?: string[];
  legend?: {
    show: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'left' | 'center' | 'right';
  };
  tooltip?: {
    show: boolean;
    format?: string;
    multiline?: boolean;
  };
  grid?: {
    show: boolean;
    strokeDasharray?: string;
  };
  responsive?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface AxisConfig {
  field: string;
  label?: string;
  type?: 'linear' | 'categorical' | 'temporal';
  format?: string;
  angle?: number;
  hide?: boolean;
  domain?: [number, number] | string[];
}

export interface SeriesConfig {
  field: string;
  name?: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
  stack?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  hide?: boolean;
}

export interface ChartProps {
  data: Record<string, any>[];
  config: ChartConfiguration;
  className?: string;
  onDataClick?: (data: any, index: number) => void;
  onError?: (error: Error) => void;
  height?: number;
  width?: number;
}

export interface ChartRendererProps extends ChartProps {
  type: ChartType;
}

export interface DataVisualizationProps {
  spec: VisualizationSpec;
  className?: string;
  showTypeSelector?: boolean;
  showExportButton?: boolean;
  onTypeChange?: (type: ChartType) => void;
  onDataClick?: (data: any, index: number) => void;
  onError?: (error: Error) => void;
}

export interface ChartTypeSelectorProps {
  currentType: ChartType;
  availableTypes: ChartType[];
  onTypeChange: (type: ChartType) => void;
  disabled?: boolean;
  className?: string;
}

export interface UseVisualizationState {
  spec: VisualizationSpec | null;
  loading: boolean;
  error: string | null;
  selectedType: ChartType | null;
}

export interface UseVisualizationActions {
  setSpec: (spec: VisualizationSpec) => void;
  setSelectedType: (type: ChartType) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetState: () => void;
}

export interface UseVisualizationReturn extends UseVisualizationState, UseVisualizationActions {}

// Chart-specific prop interfaces
export interface BarChartProps extends ChartProps {
  stackId?: string;
  barSize?: number;
  maxBarSize?: number;
}

export interface LineChartProps extends ChartProps {
  strokeWidth?: number;
  dot?: boolean;
  activeDot?: boolean;
  connectNulls?: boolean;
}

export interface PieChartProps extends ChartProps {
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cx?: number | string;
  cy?: number | string;
  showLabel?: boolean;
  labelFormat?: string;
}

export interface AreaChartProps extends ChartProps {
  stackId?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  connectNulls?: boolean;
}

export interface ScatterChartProps extends ChartProps {
  zAxisField?: string;
  bubbleSize?: number;
  minBubbleSize?: number;
  maxBubbleSize?: number;
}

// Utility types for chart data processing
export interface ProcessedChartData {
  data: Record<string, any>[];
  keys: string[];
  colors: string[];
  domain?: [number, number];
}

export interface ChartTheme {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
  grid: {
    stroke: string;
    strokeDasharray: string;
  };
  axis: {
    stroke: string;
    fontSize: number;
    fontFamily: string;
  };
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    borderRadius: number;
  };
}

// Error types
export interface ChartError extends Error {
  chartType?: ChartType;
  data?: any;
  config?: ChartConfiguration;
}

// Export utility
export interface ExportOptions {
  format: 'csv' | 'json' | 'png' | 'svg';
  filename?: string;
  includeMetadata?: boolean;
}