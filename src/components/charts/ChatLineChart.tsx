import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber } from './BaseChart';
import { useTheme } from '@/contexts/ThemeContext';
import { getLineChartOptions, getChartDataColors, ChartColorScheme } from '@/utils/chartTheme';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChatLineChartProps {
  graphData: GraphData;
  className?: string;
  colorScheme?: ChartColorScheme;
}

/**
 * Line chart component for chat graph visualizations using Chart.js
 */
export const ChatLineChart: React.FC<ChatLineChartProps> = ({ graphData, className, colorScheme = 'professional-mixed' }) => {
  const { isDark } = useTheme();
  const { primary: chartColors } = getChartDataColors(colorScheme);
  
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

  const rawData = graphData.data as LineChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const strokeColor = chartColors[0]; // Always use first color from scheme

  // Prepare data for Chart.js
  const chartData = {
    labels: rawData.map(item => String(item[xKey as keyof LineChartDataPoint])),
    datasets: [
      {
        label: graphData.y_label || 'Value',
        data: rawData.map(item => {
          const value = item[yKey as keyof LineChartDataPoint];
          return typeof value === 'number' ? value : parseFloat(value as string) || 0;
        }),
        borderColor: strokeColor,
        backgroundColor: strokeColor + '20', // Add transparency for fill
        borderWidth: 2,
        tension: 0.1, // Slight curve for smooth lines
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: strokeColor,
        pointBorderColor: isDark ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Chart.js options with theme support
  const options = getLineChartOptions(isDark, {
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatNumber(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: graphData.x_label || 'X Axis',
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
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
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <div style={{ position: 'relative', height: '400px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </BaseChartWrapper>
  );
};

export default ChatLineChart;