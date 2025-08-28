import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { ScatterChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber } from './BaseChart';
import { useTheme } from '@/contexts/ThemeContext';
import { getScatterChartOptions } from '@/utils/chartTheme';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ChatScatterChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Scatter chart component for chat graph visualizations using Chart.js
 */
export const ChatScatterChart: React.FC<ChatScatterChartProps> = ({ graphData, className }) => {
  const { isDark } = useTheme();
  
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

  const rawData = graphData.data as ScatterChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const fillColor = graphData.fill || '#dc2626';

  // Transform data for Chart.js scatter format
  const chartData = {
    datasets: [
      {
        label: graphData.title || 'Data Points',
        data: rawData.map(item => ({
          x: typeof item[xKey] === 'number' ? item[xKey] : parseFloat(item[xKey] as string) || 0,
          y: typeof item[yKey] === 'number' ? item[yKey] : parseFloat(item[yKey] as string) || 0,
        })),
        backgroundColor: fillColor + '80', // Add transparency
        borderColor: fillColor,
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // Chart.js options with theme support
  const options = getScatterChartOptions(isDark, {
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const x = context.parsed.x;
            const y = context.parsed.y;
            return [
              `${graphData.x_label || 'X'}: ${formatNumber(x)}`,
              `${graphData.y_label || 'Y'}: ${formatNumber(y)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: graphData.x_label || 'X Axis',
        },
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          },
        },
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: graphData.y_label || 'Y Axis',
        },
        ticks: {
          callback: function(value: any) {
            return formatNumber(value);
          },
        },
      },
    },
  });

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} data points`}
      className={className}
    >
      <div style={{ position: 'relative', height: '400px', width: '100%' }}>
        <Scatter data={chartData} options={options} />
      </div>
    </BaseChartWrapper>
  );
};

export default ChatScatterChart;