/**
 * Chart utility functions for data processing and formatting
 */

import { ChartType, ChartConfiguration, ProcessedChartData, ChartTheme } from '@/types/visualization.types';

// Default color palettes
const COLOR_PALETTES = {
  primary: [
    '#dc2626', '#b91c1c', '#ef4444', '#f87171', '#fca5a5',
    '#991b1b', '#7f1d1d', '#450a0a', '#fecaca', '#fee2e2'
  ],
  blue: [
    '#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd',
    '#1e40af', '#1e3a8a', '#172554', '#dbeafe', '#eff6ff'
  ],
  green: [
    '#16a34a', '#15803d', '#22c55e', '#4ade80', '#86efac',
    '#166534', '#14532d', '#052e16', '#dcfce7', '#f0fdf4'
  ],
  purple: [
    '#9333ea', '#7c3aed', '#a855f7', '#c084fc', '#d8b4fe',
    '#6b21a8', '#581c87', '#3b0764', '#e9d5ff', '#f3e8ff'
  ],
  neutral: [
    '#6b7280', '#4b5563', '#9ca3af', '#d1d5db', '#e5e7eb',
    '#374151', '#1f2937', '#111827', '#f3f4f6', '#f9fafb'
  ]
};

// Light and dark theme configurations
const THEMES: Record<'light' | 'dark', ChartTheme> = {
  light: {
    colors: COLOR_PALETTES,
    grid: {
      stroke: '#e5e7eb',
      strokeDasharray: '3 3'
    },
    axis: {
      stroke: '#374151',
      fontSize: 12,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      textColor: '#374151',
      borderRadius: 8
    }
  },
  dark: {
    colors: COLOR_PALETTES,
    grid: {
      stroke: '#374151',
      strokeDasharray: '3 3'
    },
    axis: {
      stroke: '#d1d5db',
      fontSize: 12,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textColor: '#f3f4f6',
      borderRadius: 8
    }
  }
};

/**
 * Prepares chart data based on chart type and configuration
 */
export function prepareChartData(
  data: Record<string, any>[],
  chartType: ChartType,
  config: ChartConfiguration
): ProcessedChartData {
  if (!data || data.length === 0) {
    return { data: [], keys: [], colors: [] };
  }

  let processedData = [...data];
  let keys: string[] = [];
  let colors: string[] = [];

  switch (chartType) {
    case 'bar':
    case 'line':
    case 'area':
      // For these chart types, identify numeric fields
      keys = Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return typeof value === 'number' || !isNaN(Number(value));
      });
      
      // Remove the x-axis field from keys if specified
      if (config.xAxis?.field) {
        keys = keys.filter(key => key !== config.xAxis?.field);
      }
      break;

    case 'pie':
      // For pie charts, we need a value field and a label field
      const valueField = config.yAxis?.field || keys.find(key => 
        typeof data[0][key] === 'number'
      ) || 'value';
      const labelField = config.xAxis?.field || 'name';
      
      processedData = data.map(item => ({
        name: item[labelField],
        value: Number(item[valueField]) || 0,
        ...item
      }));
      keys = ['value'];
      break;

    case 'scatter':
      // For scatter plots, we need x and y coordinates
      const xField = config.xAxis?.field || 'x';
      const yField = config.yAxis?.field || 'y';
      keys = [xField, yField];
      break;

    default:
      keys = Object.keys(data[0]);
  }

  // Get colors based on the number of keys
  colors = getChartColors(keys.length, 'light');

  return {
    data: processedData,
    keys,
    colors
  };
}

/**
 * Gets color palette for charts
 */
export function getChartColors(count: number, theme: 'light' | 'dark' = 'light'): string[] {
  const palette = THEMES[theme].colors.primary;
  
  if (count <= palette.length) {
    return palette.slice(0, count);
  }
  
  // If we need more colors, cycle through the palette
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  
  return colors;
}

/**
 * Formats axis values based on the specified format
 */
export function formatAxisValue(value: any, format?: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (!format) {
    return String(value);
  }

  const numValue = Number(value);
  
  switch (format) {
    case 'percentage':
      return `${(numValue * 100).toFixed(1)}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(numValue);
    case 'decimal1':
      return numValue.toFixed(1);
    case 'decimal2':
      return numValue.toFixed(2);
    case 'integer':
      return Math.round(numValue).toString();
    case 'abbreviated':
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M`;
      } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(1)}K`;
      }
      return numValue.toString();
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'time':
      return new Date(value).toLocaleTimeString();
    default:
      return String(value);
  }
}

/**
 * Infers the best chart type based on data characteristics
 */
export function inferChartType(
  data: Record<string, any>[],
  columnTypes: Record<string, 'numeric' | 'categorical' | 'temporal' | 'text'>
): ChartType {
  if (!data || data.length === 0) {
    return 'bar';
  }

  const numericFields = Object.entries(columnTypes)
    .filter(([_, type]) => type === 'numeric')
    .map(([field]) => field);
  
  const categoricalFields = Object.entries(columnTypes)
    .filter(([_, type]) => type === 'categorical')
    .map(([field]) => field);
  
  const temporalFields = Object.entries(columnTypes)
    .filter(([_, type]) => type === 'temporal')
    .map(([field]) => field);

  // If we have temporal data, prefer line charts
  if (temporalFields.length > 0 && numericFields.length > 0) {
    return 'line';
  }

  // If we have two numeric fields, scatter plot might be good
  if (numericFields.length >= 2) {
    return 'scatter';
  }

  // If we have one numeric and one categorical, bar chart
  if (numericFields.length === 1 && categoricalFields.length >= 1) {
    // If categorical field has many unique values, consider pie chart
    const categoricalField = categoricalFields[0];
    const uniqueValues = new Set(data.map(item => item[categoricalField])).size;
    
    if (uniqueValues <= 6) {
      return 'pie';
    } else {
      return 'bar';
    }
  }

  // Default to bar chart
  return 'bar';
}

/**
 * Gets theme configuration
 */
export function getTheme(theme: 'light' | 'dark' = 'light'): ChartTheme {
  return THEMES[theme];
}

/**
 * Generates a responsive container configuration
 */
export function getResponsiveConfig(width?: number, height?: number) {
  return {
    width: width || '100%',
    height: height || 400,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };
}

/**
 * Validates chart configuration
 */
export function validateChartConfig(
  chartType: ChartType,
  config: ChartConfiguration,
  data: Record<string, any>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push('Data array is empty');
    return { valid: false, errors };
  }

  const firstItem = data[0];
  const availableFields = Object.keys(firstItem);

  // Check if required fields exist in data
  if (config.xAxis?.field && !availableFields.includes(config.xAxis.field)) {
    errors.push(`X-axis field '${config.xAxis.field}' not found in data`);
  }

  if (config.yAxis && 'field' in config.yAxis && 
      config.yAxis.field && !availableFields.includes(config.yAxis.field)) {
    errors.push(`Y-axis field '${config.yAxis.field}' not found in data`);
  }

  // Chart type specific validations
  switch (chartType) {
    case 'scatter':
      if (!config.xAxis?.field || !config.yAxis?.field) {
        errors.push('Scatter plot requires both X and Y axis fields');
      }
      break;
    case 'pie':
      if (!config.yAxis?.field) {
        errors.push('Pie chart requires a value field in Y axis configuration');
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates a default configuration for a chart type
 */
export function createDefaultConfig(
  chartType: ChartType,
  data: Record<string, any>[]
): ChartConfiguration {
  if (!data || data.length === 0) {
    return {};
  }

  const fields = Object.keys(data[0]);
  const numericFields = fields.filter(field => 
    typeof data[0][field] === 'number' || !isNaN(Number(data[0][field]))
  );
  const categoricalFields = fields.filter(field => 
    typeof data[0][field] === 'string'
  );

  const config: ChartConfiguration = {
    responsive: true,
    grid: { show: true, strokeDasharray: '3 3' },
    tooltip: { show: true, multiline: true },
    legend: { show: true, position: 'bottom', align: 'center' }
  };

  switch (chartType) {
    case 'bar':
    case 'line':
    case 'area':
      config.xAxis = { 
        field: categoricalFields[0] || fields[0], 
        type: 'categorical' 
      };
      config.yAxis = { 
        field: numericFields[0] || fields[1], 
        type: 'linear' 
      };
      break;
    case 'scatter':
      config.xAxis = { 
        field: numericFields[0] || fields[0], 
        type: 'linear' 
      };
      config.yAxis = { 
        field: numericFields[1] || fields[1], 
        type: 'linear' 
      };
      break;
    case 'pie':
      config.xAxis = { 
        field: categoricalFields[0] || fields[0], 
        type: 'categorical' 
      };
      config.yAxis = { 
        field: numericFields[0] || fields[1], 
        type: 'linear' 
      };
      config.legend = { show: true, position: 'right', align: 'center' };
      break;
  }

  return config;
}