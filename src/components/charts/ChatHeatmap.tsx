import React from 'react';
import { HeatmapDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData } from './BaseChart';

interface ChatHeatmapProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Custom heatmap component for chat graph visualizations
 * Note: Recharts doesn't have native heatmap support, so this is a custom implementation
 */
export const ChatHeatmap: React.FC<ChatHeatmapProps> = ({ graphData, className }) => {
  console.log('[ChatHeatmap] Rendering with data:', {
    title: graphData.title,
    dataLength: graphData.data?.length,
    xKey: graphData.x_key,
    yKey: graphData.y_key,
    valueKey: graphData.value_key
  });

  // Validate data
  const validationError = validateChartData(
    graphData.data,
    [
      graphData.x_key || 'x',
      graphData.y_key || 'y',
      graphData.value_key || 'value'
    ]
  );

  if (validationError) {
    console.error('[ChatHeatmap] Validation failed:', validationError);
    return (
      <BaseChartWrapper
        title={graphData.title}
        error={validationError}
        className={className}
      />
    );
  }

  const data = graphData.data as HeatmapDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const valueKey = graphData.value_key || 'value';

  // Extract unique x and y values
  const xValues = [...new Set(data.map(d => d[xKey as keyof HeatmapDataPoint]))];
  const yValues = [...new Set(data.map(d => d[yKey as keyof HeatmapDataPoint]))];

  // Find min and max values for color scaling
  const values = data.map(d => d[valueKey as keyof HeatmapDataPoint] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Color interpolation function
  const getColor = (value: number): string => {
    const normalized = (value - minValue) / (maxValue - minValue);
    const intensity = Math.round(normalized * 255);
    // Red gradient: from light to dark
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  };

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach(d => {
    const key = `${d[xKey as keyof HeatmapDataPoint]}-${d[yKey as keyof HeatmapDataPoint]}`;
    dataMap.set(key, d[valueKey as keyof HeatmapDataPoint] as number);
  });

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} data points`}
      className={className}
    >
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] p-4">
          {/* Y-axis label */}
          {graphData.y_label && (
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {graphData.y_label}
            </div>
          )}
          
          {/* Heatmap grid */}
          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pr-2">
              {yValues.map((yValue, yIndex) => (
                <div
                  key={`y-${yIndex}`}
                  className="h-10 flex items-center justify-end text-sm text-gray-600 dark:text-gray-400"
                  style={{ minHeight: '40px' }}
                >
                  {String(yValue)}
                </div>
              ))}
            </div>

            {/* Heatmap cells */}
            <div className="flex-1">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${xValues.length}, 1fr)` }}>
                {yValues.map((yValue, yIndex) => (
                  xValues.map((xValue, xIndex) => {
                    const key = `${xValue}-${yValue}`;
                    const value = dataMap.get(key) || 0;
                    const color = getColor(value);

                    return (
                      <div
                        key={`cell-${yIndex}-${xIndex}`}
                        className="relative group cursor-pointer transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: color,
                          minHeight: '40px',
                          minWidth: '60px',
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute hidden group-hover:block z-10 px-2 py-1 bg-gray-900 text-white text-xs rounded pointer-events-none -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          {`${xValue}, ${yValue}: ${value}`}
                        </div>
                        {/* Value display for larger cells */}
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs font-medium" style={{
                            color: value > (maxValue + minValue) / 2 ? 'white' : 'black'
                          }}>
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ))}
              </div>

              {/* X-axis labels */}
              <div className="grid mt-2" style={{ gridTemplateColumns: `repeat(${xValues.length}, 1fr)` }}>
                {xValues.map((xValue, xIndex) => (
                  <div
                    key={`x-${xIndex}`}
                    className="text-xs text-center text-gray-600 dark:text-gray-400 px-1"
                    style={{ minWidth: '60px' }}
                  >
                    {String(xValue)}
                  </div>
                ))}
              </div>

              {/* X-axis label */}
              {graphData.x_label && (
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mt-3">
                  {graphData.x_label}
                </div>
              )}
            </div>
          </div>

          {/* Color scale legend */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {graphData.value_label || 'Value'}: {minValue}
            </span>
            <div className="flex h-4 w-32 rounded overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`legend-${i}`}
                  className="flex-1"
                  style={{
                    backgroundColor: getColor(minValue + (maxValue - minValue) * (i / 9))
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {maxValue}
            </span>
          </div>
        </div>
      </div>
    </BaseChartWrapper>
  );
};

export default ChatHeatmap;