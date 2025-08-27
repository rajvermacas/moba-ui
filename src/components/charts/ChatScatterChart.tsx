import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ScatterChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_MARGIN } from './BaseChart';

interface ChatScatterChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Scatter chart component for chat graph visualizations
 */
export const ChatScatterChart: React.FC<ChatScatterChartProps> = ({ graphData, className }) => {
  console.log('[ChatScatterChart] Rendering with data:', {
    title: graphData.title,
    dataLength: graphData.data?.length,
    xKey: graphData.x_key,
    yKey: graphData.y_key
  });

  // Validate data
  const validationError = validateChartData(
    graphData.data,
    [graphData.x_key || 'x', graphData.y_key || 'y']
  );

  if (validationError) {
    console.error('[ChatScatterChart] Validation failed:', validationError);
    return (
      <BaseChartWrapper
        title={graphData.title}
        error={validationError}
        className={className}
      />
    );
  }

  const data = graphData.data as ScatterChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const fillColor = graphData.fill || '#dc2626';

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} data points`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={DEFAULT_CHART_MARGIN}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700"
          />
          <XAxis 
            dataKey={xKey}
            name={graphData.x_label || 'X Axis'}
            label={{ 
              value: graphData.x_label || 'X Axis', 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle' }
            }}
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
            type="number"
            domain={['dataMin', 'dataMax']}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            dataKey={yKey}
            name={graphData.y_label || 'Y Axis'}
            label={{ 
              value: graphData.y_label || 'Y Axis', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
            type="number"
            domain={['dataMin', 'dataMax']}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
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
          <Scatter 
            name={graphData.title || 'Data Points'}
            data={data} 
            fill={fillColor}
            animationDuration={500}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </BaseChartWrapper>
  );
};

export default ChatScatterChart;