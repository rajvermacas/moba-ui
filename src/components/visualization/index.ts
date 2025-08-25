/**
 * Export all visualization components
 */

// Main components
export { DataVisualization } from './DataVisualization';
export { ChartRenderer } from './ChartRenderer';
export { ChartTypeSelector } from './ChartTypeSelector';

// Individual chart components
export * from './charts';

// Types
export type {
  VisualizationSpec,
  ChartConfiguration,
  AxisConfig,
  SeriesConfig,
  ChartProps,
  ChartRendererProps,
  DataVisualizationProps,
  ChartTypeSelectorProps,
  ChartType,
  BarChartProps,
  LineChartProps,
  PieChartProps,
  AreaChartProps,
  ScatterChartProps,
  ProcessedChartData,
  ChartTheme,
  ChartError,
  ExportOptions
} from '@/types/visualization.types';

// Utility functions
export {
  prepareChartData,
  getChartColors,
  formatAxisValue,
  inferChartType,
  getTheme,
  getResponsiveConfig,
  validateChartConfig,
  createDefaultConfig
} from '@/utils/chartHelpers';

// Hooks
export { useVisualization, useVisualizationSpec } from '@/hooks/useVisualization';