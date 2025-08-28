import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AreaChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber } from './BaseChart';
import { useTheme } from '@/contexts/ThemeContext';
import { getLineChartOptions } from '@/utils/chartTheme';

// Register Chart.js components (including Filler for area charts)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChatAreaChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Area chart component for chat graph visualizations using Chart.js
 * Implemented as a Line chart with fill
 */
export const ChatAreaChart: React.FC<ChatAreaChartProps> = ({ graphData, className }) => {
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

  const rawData = graphData.data as AreaChartDataPoint[];
  const xKey = graphData.x_key || 'x';
  const yKey = graphData.y_key || 'y';
  const fillColor = graphData.fill || '#dc2626';

  // Prepare data for Chart.js (Line chart with fill for area effect)
  const chartData = {
    labels: rawData.map(item => String(item[xKey])),
    datasets: [
      {
        label: graphData.y_label || 'Value',
        data: rawData.map(item => {
          const value = item[yKey];
          return typeof value === 'number' ? value : parseFloat(value as string) || 0;
        }),
        fill: true, // This makes it an area chart
        borderColor: fillColor,
        backgroundColor: fillColor + '30', // Transparent fill
        borderWidth: 2,
        tension: 0.4, // Smooth curve
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: fillColor,
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
        beginAtZero: true,
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
    interaction: {
      mode: 'index' as const,
      intersect: false,
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

export default ChatAreaChart;