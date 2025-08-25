/**
 * AreaChart component using Recharts
 */

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AreaChartProps } from '@/types/visualization.types';
import { formatAxisValue, getChartColors, getTheme } from '@/utils/chartHelpers';
import { useTheme } from '@/contexts/ThemeContext';

interface AreaChartComponentProps extends AreaChartProps {}

// Helper to get first yAxis config when it might be an array
const getYAxisConfig = (yAxis?: any) => {
  if (!yAxis) return undefined;
  return Array.isArray(yAxis) ? yAxis[0] : yAxis;
};

export const AreaChart: React.FC<AreaChartComponentProps> = ({
  data,
  config,
  className = '',
  onDataClick,
  onError,
  height = 400,
  width,
  stackId,
  strokeWidth = 1,
  fillOpacity = 0.6,
  connectNulls = false
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
    // Get colors for areas
    const colors = config.colors || getChartColors(10, isDark ? 'dark' : 'light');
    
    // Determine series fields
    const yAxisFields = Array.isArray(config.yAxis) ? config.yAxis.map(axis => axis.field) : [getYAxisConfig(config.yAxis)?.field].filter(Boolean);
    const seriesFields = (config.series?.map(s => s.field) || yAxisFields).filter((f): f is string => Boolean(f));

    const handleClick = (data: any) => {
      if (onDataClick && data && data.activePayload) {
        onDataClick(data.activePayload[0]?.payload, data.activeTooltipIndex);
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
            <p className="font-medium mb-2">{`${config.xAxis?.label || 'X'}: ${formatAxisValue(label, config.xAxis?.format)}`}</p>
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
          <RechartsAreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleClick}
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
              tickFormatter={(value) => formatAxisValue(value, config.xAxis?.format)}
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
              domain={getYAxisConfig(config.yAxis)?.domain as any}
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

            {/* Render areas */}
            {seriesFields.map((field, index) => {
              const seriesConfig = config.series?.find(s => s.field === field);
              const areaColor = seriesConfig?.color || colors[index % colors.length];
              
              return (
                <Area
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stackId={seriesConfig?.stack || stackId}
                  stroke={areaColor}
                  fill={areaColor}
                  strokeWidth={seriesConfig?.strokeWidth || strokeWidth}
                  fillOpacity={seriesConfig?.fillOpacity || fillOpacity}
                  name={seriesConfig?.name || field}
                  connectNulls={connectNulls}
                  hide={seriesConfig?.hide}
                />
              );
            })}
          </RechartsAreaChart>
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