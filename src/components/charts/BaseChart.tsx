import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface BaseChartProps {
  children: ReactNode;
  title?: string;
  className?: string;
  onError?: (error: Error) => void;
}

/**
 * Error boundary wrapper for chart components
 * Catches rendering errors and displays fallback UI
 */
class ChartErrorBoundary extends Component<BaseChartProps, ErrorBoundaryState> {
  constructor(props: BaseChartProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[ChartErrorBoundary] Chart rendering failed:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ChartErrorBoundary] Error details:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ChartErrorBoundary'
    });
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">
            Chart Rendering Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 text-center">
            {this.state.error?.message || 'Failed to render chart'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Please check the data format and try again
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface BaseChartWrapperProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  children?: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Base wrapper component for all chart types
 * Provides consistent styling, loading states, and error handling
 */
export const BaseChartWrapper: React.FC<BaseChartWrapperProps> = ({
  title,
  subtitle,
  loading = false,
  error,
  className = '',
  children,
  onError
}) => {
  console.log('[BaseChartWrapper] Rendering chart:', { title, loading, error });

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-sm text-red-600 dark:text-red-300 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <ChartErrorBoundary title={title} onError={onError}>
        {children}
      </ChartErrorBoundary>
    </div>
  );
};

/**
 * Validates chart data before rendering
 */
export const validateChartData = (data: any[], requiredKeys: string[]): string | null => {
  console.log('[validateChartData] Validating data:', { 
    dataLength: data?.length, 
    requiredKeys,
    sampleData: data?.[0] 
  });

  if (!data || !Array.isArray(data)) {
    return 'Invalid data format: expected array';
  }

  if (data.length === 0) {
    return 'No data available to display';
  }

  // Check if all required keys exist in the first data point
  const firstItem = data[0];
  const missingKeys = requiredKeys.filter(key => !(key in firstItem));
  
  if (missingKeys.length > 0) {
    return `Missing required data fields: ${missingKeys.join(', ')}`;
  }

  // Check if numeric fields are actually numeric
  const numericFields = requiredKeys.filter(key => key !== 'name' && key !== 'x' || (key === 'x' && typeof firstItem[key] === 'number'));
  for (const field of numericFields) {
    if (field in firstItem && typeof firstItem[field] !== 'number') {
      return `Field '${field}' must contain numeric values`;
    }
  }

  return null; // No validation errors
};

/**
 * Default color palette for charts
 */
export const DEFAULT_CHART_COLORS = [
  '#dc2626', // red-600
  '#ef4444', // red-500
  '#f87171', // red-400
  '#fca5a5', // red-300
  '#fecaca', // red-200
  '#991b1b', // red-800
  '#7f1d1d', // red-900
  '#450a0a', // red-950
  '#fef2f2', // red-50
  '#fee2e2', // red-100
];

/**
 * Formats large numbers for display
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

/**
 * Common chart margins
 */
export const DEFAULT_CHART_MARGIN = { 
  top: 20, 
  right: 30, 
  bottom: 60, 
  left: 60 
};

export default BaseChartWrapper;