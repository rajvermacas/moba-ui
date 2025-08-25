/**
 * Main data visualization container component
 */

import React, { useState, useCallback, useMemo } from 'react';
import { DataVisualizationProps, ChartType, ExportOptions } from '@/types/visualization.types';
import { ChartRenderer } from './ChartRenderer';
import { ChartTypeSelector } from './ChartTypeSelector';
import ErrorBoundary from '../ui/ErrorBoundary';
import { ChartContainer } from '../ui/ChartContainer';
import { Download, RefreshCw, Settings, Eye } from 'lucide-react';

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  spec,
  className = '',
  showTypeSelector = true,
  showExportButton = true,
  onTypeChange,
  onDataClick,
  onError
}) => {
  const [selectedType, setSelectedType] = useState<ChartType>(spec.chart_type);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available chart types based on spec
  const availableTypes: ChartType[] = useMemo(() => {
    const types = new Set<ChartType>([spec.chart_type]);
    spec.alternatives.forEach(alt => types.add(alt));
    return Array.from(types);
  }, [spec]);

  // Handle chart type change
  const handleTypeChange = useCallback((type: ChartType) => {
    setSelectedType(type);
    setError(null);
    if (onTypeChange) {
      onTypeChange(type);
    }
  }, [onTypeChange]);

  // Handle chart errors
  const handleChartError = useCallback((error: Error) => {
    const errorMessage = error.message || 'An error occurred while rendering the chart';
    setError(errorMessage);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Export functionality
  const handleExport = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const { format, filename = 'chart-data', includeMetadata = false } = options;

      switch (format) {
        case 'csv': {
          // Export as CSV
          const headers = Object.keys(spec.data[0]);
          const csvContent = [
            includeMetadata ? [`# ${spec.metadata?.title || 'Chart Data'}`] : [],
            includeMetadata ? [`# Generated: ${new Date().toLocaleString()}`] : [],
            includeMetadata ? [`# Chart Type: ${selectedType}`] : [],
            includeMetadata ? [''] : [],
            headers,
            ...spec.data.map(row => headers.map(header => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : String(value);
            }))
          ].filter(row => row.length).map(row => row.join(',')).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }

        case 'json': {
          // Export as JSON
          const exportData = {
            ...(includeMetadata && {
              metadata: {
                ...spec.metadata,
                exportedAt: new Date().toISOString(),
                chartType: selectedType,
                totalRecords: spec.data.length
              }
            }),
            chartType: selectedType,
            config: spec.config,
            columnTypes: spec.column_types,
            data: spec.data
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }

        case 'png':
        case 'svg': {
          // For image exports, we would need to implement canvas/SVG capture
          // This is a placeholder implementation
          console.warn(`${format.toUpperCase()} export not yet implemented`);
          setError(`${format.toUpperCase()} export is not yet available`);
          break;
        }

        default:
          setError(`Unsupported export format: ${format}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsExporting(false);
    }
  }, [spec, selectedType, onError]);

  // Quick export as CSV
  const handleQuickExport = useCallback(() => {
    handleExport({ format: 'csv', includeMetadata: true });
  }, [handleExport]);

  // Chart title and description
  const chartTitle = spec.metadata?.title || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Chart`;
  const chartDescription = spec.metadata?.description || 
    `Data visualization showing ${spec.data.length} records`;

  // Get current configuration for selected type
  const currentConfig = selectedType === spec.chart_type 
    ? spec.config 
    : { ...spec.config }; // Could create default config for different type

  return (
    <div className={`data-visualization ${className}`}>
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💥</div>
              <p>Visualization Error</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Something went wrong while rendering the visualization
              </p>
            </div>
          </div>
        }
      >
        <ChartContainer
          title={chartTitle}
          description={chartDescription}
          filters={
            showTypeSelector ? (
              <ChartTypeSelector
                currentType={selectedType}
                availableTypes={availableTypes}
                onTypeChange={handleTypeChange}
                className="mb-4"
              />
            ) : undefined
          }
          actions={
            <div className="flex items-center gap-2">
              {/* Data info badge */}
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                {spec.data.length} records
              </span>

              {/* Recommended badge */}
              {spec.recommended && (
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  Recommended
                </span>
              )}

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-secondary text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                title="Chart settings"
              >
                <Settings size={16} />
              </button>

              {/* Export button */}
              {showExportButton && (
                <button
                  onClick={handleQuickExport}
                  disabled={isExporting}
                  className="btn-secondary text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 focus:ring-green-500 disabled:opacity-50"
                  title="Export as CSV"
                >
                  {isExporting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
              )}
            </div>
          }
        >
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 dark:text-red-400 text-sm">
                  <strong>Error:</strong> {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Chart settings panel */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Chart Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">X-Axis</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {currentConfig.xAxis?.field || 'Auto'} 
                    {currentConfig.xAxis?.label && ` (${currentConfig.xAxis.label})`}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">Y-Axis</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {Array.isArray(currentConfig.yAxis) 
                      ? currentConfig.yAxis.map(axis => axis.field).join(', ')
                      : currentConfig.yAxis?.field || 'Auto'
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">Chart Type</div>
                  <div className="text-gray-800 dark:text-gray-200 capitalize">{selectedType}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-400 mb-1">Data Points</div>
                  <div className="text-gray-800 dark:text-gray-200">{spec.data.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Main chart */}
          <ChartRenderer
            type={selectedType}
            data={spec.data}
            config={currentConfig}
            onDataClick={onDataClick}
            onError={handleChartError}
          />

          {/* Insights */}
          {spec.metadata?.insights && spec.metadata.insights.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <Eye size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Insights
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    {spec.metadata.insights.map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </ChartContainer>
      </ErrorBoundary>
    </div>
  );
};