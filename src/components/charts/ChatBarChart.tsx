import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_MARGIN } from './BaseChart';

interface ChatBarChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Bar chart component for chat graph visualizations
 */
export const ChatBarChart: React.FC<ChatBarChartProps> = ({ graphData, className }) => {
  // Debug logging
  console.log('ChatBarChart received graphData:', graphData);
  console.log('Data array:', graphData.data);
  console.log('x_key:', graphData.x_key, 'y_key:', graphData.y_key);
  
  // Validate data
  const validationError = validateChartData(
    graphData.data,
    [graphData.x_key || 'name', graphData.y_key || 'value']
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

  const data = graphData.data as BarChartDataPoint[];
  const xKey = graphData.x_key || 'name';
  const yKey = graphData.y_key || 'value';
  
  // Debug logging data and keys
  console.log('Processed data:', data);
  console.log('Using xKey:', xKey, 'yKey:', yKey);
  console.log('First data point:', data[0]);
  console.log('Value at yKey for first item:', data[0]?.[yKey]);

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={DEFAULT_CHART_MARGIN}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700"
          />
          <XAxis 
            dataKey={xKey}
            label={{ 
              value: graphData.x_label || 'Category', 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle' }
            }}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            label={{ 
              value: graphData.y_label || 'Value', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip 
            formatter={(value: number) => formatNumber(value)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey={yKey} 
            fill="#dc2626"
            radius={[4, 4, 0, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </BaseChartWrapper>
  );
};

export default ChatBarChart;