/**
 * Main chart renderer component that delegates to specific chart types
 */

import React from 'react';
import { ChartRendererProps } from '@/types/visualization.types';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { AreaChart } from './charts/AreaChart';
import { ScatterChart } from './charts/ScatterChart';
import { validateChartConfig } from '@/utils/chartHelpers';

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  config,
  className = '',
  onDataClick,
  onError,
  height,
  width
}) => {
  // Validate chart configuration
  const validation = validateChartConfig(type, config, data);
  
  if (!validation.valid) {
    const errorMessage = `Chart configuration error: ${validation.errors.join(', ')}`;
    const error = new Error(errorMessage);
    
    if (onError) {
      onError(error);
    }
    
    return (
      <div className={`flex items-center justify-center h-64 text-red-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Chart Configuration Error</p>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {validation.errors.map((error, index) => (
              <p key={index}>• {error}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Common props to pass to all chart components
  const commonProps = {
    data,
    config,
    className,
    onDataClick,
    onError,
    height,
    width
  };

  try {
    switch (type) {
      case 'bar':
        return <BarChart {...commonProps} />;
      
      case 'line':
        return <LineChart {...commonProps} />;
      
      case 'pie':
        return <PieChart {...commonProps} />;
      
      case 'area':
        return <AreaChart {...commonProps} />;
      
      case 'scatter':
        return <ScatterChart {...commonProps} />;
      
      case 'heatmap':
        // For now, we'll render a placeholder for heatmap
        // This can be implemented later with a dedicated heatmap component
        return (
          <div className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p>Heatmap visualization</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon...
              </p>
            </div>
          </div>
        );
      
      case 'table':
        // Render data as a simple table
        if (!data || data.length === 0) {
          return (
            <div className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>No data available</p>
              </div>
            </div>
          );
        }
        
        const headers = Object.keys(data[0]);
        return (
          <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {headers.map((header) => (
                    <th key={header} scope="col" className="px-6 py-3">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    {headers.map((header) => (
                      <td key={header} className="px-6 py-4">
                        {typeof row[header] === 'number' 
                          ? row[header].toLocaleString()
                          : String(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        const unsupportedError = new Error(`Unsupported chart type: ${type}`);
        
        if (onError) {
          onError(unsupportedError);
        }
        
        return (
          <div className={`flex items-center justify-center h-64 text-red-500 ${className}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">❓</div>
              <p>Unsupported Chart Type</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chart type "{type}" is not supported
              </p>
            </div>
          </div>
        );
    }
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    
    return (
      <div className={`flex items-center justify-center h-64 text-red-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Unexpected Error</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {(error as Error)?.message}
          </p>
        </div>
      </div>
    );
  }
};