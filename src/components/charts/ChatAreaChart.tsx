import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AreaChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_MARGIN } from './BaseChart';

interface ChatAreaChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Area chart component for chat graph visualizations
 */
export const ChatAreaChart: React.FC<ChatAreaChartProps> = ({ graphData, className }) => {
  console.log('[ChatAreaChart] Rendering with data:', {
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
    console.error('[ChatAreaChart] Validation failed:', validationError);
    return (
      <BaseChartWrapper
        title={graphData.title}
        error={validationError}
        className={className}
      />
    );
  }

  const data = graphData.data as AreaChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const fillColor = graphData.fill || '#dc2626';
  const fillOpacity = graphData.fillOpacity || 0.3;
  const strokeColor = graphData.stroke || '#dc2626';

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={DEFAULT_CHART_MARGIN}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone"
            dataKey={yKey} 
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={fillOpacity}
            fill="url(#colorArea)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChartWrapper>
  );
};

export default ChatAreaChart;