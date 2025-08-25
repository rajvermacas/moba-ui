/**
 * PieChart component using Recharts
 */

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PieChartProps } from '@/types/visualization.types';
import { formatAxisValue, getChartColors, getTheme } from '@/utils/chartHelpers';
import { useTheme } from '@/contexts/ThemeContext';

interface PieChartComponentProps extends PieChartProps {}

// Helper to get first yAxis config when it might be an array
const getYAxisConfig = (yAxis?: any) => {
  if (!yAxis) return undefined;
  return Array.isArray(yAxis) ? yAxis[0] : yAxis;
};

export const PieChart: React.FC<PieChartComponentProps> = ({
  data,
  config,
  className = '',
  onDataClick,
  onError,
  height = 400,
  width,
  innerRadius = 0,
  outerRadius,
  startAngle = 90,
  endAngle = -270,
  cx = '50%',
  cy = '50%',
  showLabel = true,
  labelFormat
}) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark ? 'dark' : 'light');

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🥧</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  try {
    // Get colors for pie slices
    const colors = config.colors || getChartColors(data.length, isDark ? 'dark' : 'light');
    
    // Prepare data for pie chart
    const pieData = data.map(item => {
      const nameField = config.xAxis?.field || 'name';
      const valueField = getYAxisConfig(config.yAxis)?.field || 'value';
      
      return {
        name: item[nameField] || 'Unknown',
        value: Number(item[valueField]) || 0,
        ...item
      };
    });

    const handleClick = (data: any, index: number) => {
      if (onDataClick) {
        onDataClick(data, index);
      }
    };

    const customTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        const total = pieData.reduce((sum, item) => sum + item.value, 0);
        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
        
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
            <p className="font-medium mb-1">{data.name}</p>
            <p className="text-sm">
              Value: {formatAxisValue(data.value, getYAxisConfig(config.yAxis)?.format)}
            </p>
            <p className="text-sm">
              Percentage: {percentage}%
            </p>
          </div>
        );
      }
      return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
      if (!showLabel || percent < 0.05) return null; // Don't show labels for slices < 5%
      
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill={isDark ? '#f3f4f6' : '#374151'}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontFamily={theme.axis.fontFamily}
        >
          {labelFormat === 'percentage' 
            ? `${(percent * 100).toFixed(0)}%` 
            : labelFormat === 'value'
            ? formatAxisValue(pieData.find(d => d.name === name)?.value, getYAxisConfig(config.yAxis)?.format)
            : `${name} (${(percent * 100).toFixed(0)}%)`
          }
        </text>
      );
    };

    // Calculate radius based on container size
    const calculatedOuterRadius = outerRadius || Math.min(height, 400) * 0.35;

    return (
      <div className={className}>
        <ResponsiveContainer width={width || '100%'} height={height}>
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx={cx}
              cy={cy}
              labelLine={false}
              label={showLabel ? renderCustomLabel : false}
              outerRadius={calculatedOuterRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              startAngle={startAngle}
              endAngle={endAngle}
              onClick={handleClick}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            
            {config.tooltip?.show && (
              <Tooltip content={customTooltip} />
            )}
            
            {config.legend?.show && (
              <Legend
                verticalAlign={config.legend.position === 'top' || config.legend.position === 'bottom' ? config.legend.position : 'bottom'}
                align={config.legend.align || 'center'}
                wrapperStyle={{
                  paddingTop: config.legend.position === 'bottom' ? '20px' : '0',
                  paddingBottom: config.legend.position === 'top' ? '20px' : '0',
                  fontSize: theme.axis.fontSize,
                  color: theme.axis.stroke
                }}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            )}
          </RechartsPieChart>
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