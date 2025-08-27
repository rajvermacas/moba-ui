import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { LineChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_MARGIN } from './BaseChart';

interface ChatLineChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Line chart component for chat graph visualizations
 */
export const ChatLineChart: React.FC<ChatLineChartProps> = ({ graphData, className }) => {
  // Validate data
  const validationError = validateChartData(
    graphData.data,
    [graphData.x_key || 'x', graphData.y_key || 'y']
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

  const data = graphData.data as LineChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const strokeColor = graphData.stroke || '#dc2626';

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={DEFAULT_CHART_MARGIN}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700"
          />
          <XAxis 
            dataKey={xKey}
            label={{ 
              value: graphData.x_label || 'X Axis', 
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
              value: graphData.y_label || 'Y Axis', 
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
          <Line 
            type="monotone"
            dataKey={yKey} 
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 4, fill: strokeColor }}
            activeDot={{ r: 6 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </BaseChartWrapper>
  );
};

export default ChatLineChart;