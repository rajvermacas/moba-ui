/**
 * BarChart component using Recharts
 */

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChartProps } from '@/types/visualization.types';
import { formatAxisValue, getChartColors, getTheme } from '@/utils/chartHelpers';
import { useTheme } from '@/contexts/ThemeContext';

interface BarChartComponentProps extends BarChartProps {}

// Helper to get first yAxis config when it might be an array
const getYAxisConfig = (yAxis?: any) => {
  if (!yAxis) return undefined;
  return Array.isArray(yAxis) ? yAxis[0] : yAxis;
};

export const BarChart: React.FC<BarChartComponentProps> = ({
  data,
  config,
  className = '',
  onDataClick,
  onError,
  height = 400,
  width,
  stackId,
  barSize,
  maxBarSize
}) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark ? 'dark' : 'light');

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

  try {
    // Get colors for bars
    const colors = config.colors || getChartColors(data.length, isDark ? 'dark' : 'light');
    
    // Determine if we're showing multiple series or single bars
    const yAxisFields = Array.isArray(config.yAxis) ? config.yAxis.map(axis => axis.field) : [getYAxisConfig(config.yAxis)?.field].filter(Boolean);
    const seriesFields = (config.series?.map(s => s.field) || yAxisFields).filter((f): f is string => Boolean(f));

    const handleBarClick = (data: any, index: number) => {
      if (onDataClick) {
        onDataClick(data, index);
      }
    };

    const customTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            style={{
              backgroundColor: theme.tooltip.backgroundColor,
              borderColor: theme.tooltip.borderColor,
              color: theme.tooltip.textColor,
              borderRadius: theme.tooltip.borderRadius
            }}
          >
            <p className="font-medium mb-2">{`${config.xAxis?.label || 'Category'}: ${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.name}: ${formatAxisValue(entry.value, getYAxisConfig(config.yAxis)?.format)}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className={className}>
        <ResponsiveContainer width={width || '100%'} height={height}>
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleBarClick}
          >
            {config.grid?.show && (
              <CartesianGrid 
                strokeDasharray={theme.grid.strokeDasharray}
                stroke={theme.grid.stroke}
              />
            )}
            
            <XAxis
              dataKey={config.xAxis?.field || 'name'}
              tick={{ 
                fontSize: theme.axis.fontSize, 
                fill: theme.axis.stroke,
                fontFamily: theme.axis.fontFamily 
              }}
              axisLine={{ stroke: theme.axis.stroke }}
              tickLine={{ stroke: theme.axis.stroke }}
              angle={config.xAxis?.angle || 0}
              textAnchor={config.xAxis?.angle ? 'end' : 'middle'}
              height={config.xAxis?.angle ? 80 : 60}
              interval={0}
            />
            
            <YAxis
              tick={{ 
                fontSize: theme.axis.fontSize, 
                fill: theme.axis.stroke,
                fontFamily: theme.axis.fontFamily 
              }}
              axisLine={{ stroke: theme.axis.stroke }}
              tickLine={{ stroke: theme.axis.stroke }}
              tickFormatter={(value) => formatAxisValue(value, getYAxisConfig(config.yAxis)?.format)}
              label={{
                value: getYAxisConfig(config.yAxis)?.label || 'Value',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.axis.stroke }
              }}
            />
            
            {config.tooltip?.show && (
              <Tooltip content={customTooltip} />
            )}
            
            {config.legend?.show && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: theme.axis.fontSize,
                  color: theme.axis.stroke
                }}
              />
            )}

            {/* Render bars */}
            {seriesFields.length > 0 ? (
              // Multiple series
              seriesFields.map((field, index) => {
                const seriesConfig = config.series?.find(s => s.field === field);
                return (
                  <Bar
                    key={field}
                    dataKey={field}
                    fill={seriesConfig?.color || colors[index % colors.length]}
                    name={seriesConfig?.name || field}
                    stackId={seriesConfig?.stack || stackId}
                    barSize={barSize}
                    maxBarSize={maxBarSize}
                  />
                );
              })
            ) : (
              // Single series with different colors per bar
              <Bar
                dataKey={getYAxisConfig(config.yAxis)?.field || 'value'}
                name={getYAxisConfig(config.yAxis)?.label || 'Value'}
                barSize={barSize}
                maxBarSize={maxBarSize}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    
    return (
      <div className={`flex items-center justify-center h-64 text-red-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Error rendering chart</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {(error as Error)?.message}
          </p>
        </div>
      </div>
    );
  }
};