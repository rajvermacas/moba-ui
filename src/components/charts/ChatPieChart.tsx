import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PieChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_COLORS } from './BaseChart';

interface ChatPieChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Pie chart component for chat graph visualizations
 */
export const ChatPieChart: React.FC<ChatPieChartProps> = ({ graphData, className }) => {
  // Validate data
  const validationError = validateChartData(
    graphData.data,
    [graphData.name_key || 'name', graphData.value_key || 'value']
  );

  if (validationError) {
    return (
      <BaseChartWrapper
        title={graphData.title}
        error={validationError}
        className={className}
      />
    );
  }

  const data = graphData.data as PieChartDataPoint[];
  const nameKey = graphData.name_key || 'name';
  const valueKey = graphData.value_key || 'value';

  // Custom label renderer for pie slices
  const renderCustomLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} categories`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
            animationBegin={0}
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatNumber(value)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, entry: any) => (
              <span className="text-sm">
                {value}: {formatNumber(entry.payload[valueKey])}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </BaseChartWrapper>
  );
};

export default ChatPieChart;