/**
 * ScatterChart component using Recharts
 */

import React from 'react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { ScatterChartProps } from '@/types/visualization.types';
import { formatAxisValue, getChartColors, getTheme } from '@/utils/chartHelpers';
import { useTheme } from '@/contexts/ThemeContext';

interface ScatterChartComponentProps extends ScatterChartProps {}

export const ScatterChart: React.FC<ScatterChartComponentProps> = ({
  data,
  config,
  className = '',
  onDataClick,
  onError,
  height = 400,
  width,
  zAxisField,
  bubbleSize = 64,
  minBubbleSize = 20,
  maxBubbleSize = 400
}) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark ? 'dark' : 'light');

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">💧</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  try {
    // Get colors for scatter points
    const colors = config.colors || getChartColors(1, isDark ? 'dark' : 'light');
    
    // Prepare data for scatter plot
    const xField = config.xAxis?.field || 'x';
    const yField = config.yAxis?.field || 'y';
    const zField = zAxisField || config.series?.[0]?.field;
    
    const scatterData = data.map((item, index) => ({
      x: Number(item[xField]) || 0,
      y: Number(item[yField]) || 0,
      z: zField ? Number(item[zField]) || bubbleSize : bubbleSize,
      originalData: item,
      index
    }));

    // Calculate z-axis domain for bubble scaling
    let zDomain: [number, number] = [minBubbleSize, maxBubbleSize];
    if (zField) {
      const zValues = scatterData.map(d => d.z);
      const minZ = Math.min(...zValues);
      const maxZ = Math.max(...zValues);
      if (minZ !== maxZ) {
        zDomain = [minZ, maxZ];
      }
    }

    const handleClick = (data: any) => {
      if (onDataClick && data && data.payload) {
        onDataClick(data.payload.originalData, data.payload.index);
      }
    };

    const customTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        
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
            <p className="font-medium mb-2">Data Point</p>
            <p className="text-sm">
              {config.xAxis?.label || 'X'}: {formatAxisValue(data.x, config.xAxis?.format)}
            </p>
            <p className="text-sm">
              {config.yAxis?.label || 'Y'}: {formatAxisValue(data.y, config.yAxis?.format)}
            </p>
            {zField && (
              <p className="text-sm">
                {zField}: {formatAxisValue(data.z, 'decimal2')}
              </p>
            )}
            {/* Show additional data fields */}
            {Object.entries(data.originalData).map(([key, value]) => {
              if (key !== xField && key !== yField && key !== zField && typeof value !== 'object') {
                return (
                  <p key={key} className="text-xs text-gray-600 dark:text-gray-400">
                    {key}: {String(value)}
                  </p>
                );
              }
              return null;
            })}
          </div>
        );
      }
      return null;
    };

    return (
      <div className={className}>
        <ResponsiveContainer width={width || '100%'} height={height}>
          <RechartsScatterChart
            data={scatterData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            {config.grid?.show && (
              <CartesianGrid 
                strokeDasharray={theme.grid.strokeDasharray}
                stroke={theme.grid.stroke}
              />
            )}
            
            <XAxis
              type="number"
              dataKey="x"
              name={config.xAxis?.label || 'X'}
              tick={{ 
                fontSize: theme.axis.fontSize, 
                fill: theme.axis.stroke,
                fontFamily: theme.axis.fontFamily 
              }}
              axisLine={{ stroke: theme.axis.stroke }}
              tickLine={{ stroke: theme.axis.stroke }}
              tickFormatter={(value) => formatAxisValue(value, config.xAxis?.format)}
              label={{
                value: config.xAxis?.label || 'X-Axis',
                position: 'bottom',
                offset: 0,
                style: { textAnchor: 'middle', fill: theme.axis.stroke }
              }}
              domain={config.xAxis?.domain as any || ['dataMin - 5', 'dataMax + 5']}
            />
            
            <YAxis
              type="number"
              dataKey="y"
              name={config.yAxis?.label || 'Y'}
              tick={{ 
                fontSize: theme.axis.fontSize, 
                fill: theme.axis.stroke,
                fontFamily: theme.axis.fontFamily 
              }}
              axisLine={{ stroke: theme.axis.stroke }}
              tickLine={{ stroke: theme.axis.stroke }}
              tickFormatter={(value) => formatAxisValue(value, config.yAxis?.format)}
              label={{
                value: config.yAxis?.label || 'Y-Axis',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.axis.stroke }
              }}
              domain={config.yAxis?.domain as any || ['dataMin - 5', 'dataMax + 5']}
            />

            {zField && (
              <ZAxis
                type="number"
                dataKey="z"
                range={[minBubbleSize, maxBubbleSize]}
                name={zField}
                domain={zDomain}
              />
            )}
            
            {config.tooltip?.show && (
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={customTooltip}
              />
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

            <Scatter
              name={config.series?.[0]?.name || 'Data'}
              data={scatterData}
              fill={colors[0]}
              onClick={handleClick}
              shape="circle"
            />
          </RechartsScatterChart>
        </ResponsiveContainer>
        
        {/* Legend for bubble sizes */}
        {zField && (
          <div className="mt-4 flex justify-center">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Bubble size represents: <span className="font-medium">{zField}</span>
            </div>
          </div>
        )}
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