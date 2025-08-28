import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PieChartDataPoint, GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_COLORS } from './BaseChart';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

  const rawData = graphData.data as PieChartDataPoint[];
  const nameKey = graphData.name_key || 'name';
  const valueKey = graphData.value_key || 'value';

  // Prepare data for Chart.js
  const chartData = {
    labels: rawData.map(item => item[nameKey] as string),
    datasets: [
      {
        data: rawData.map(item => item[valueKey] as number),
        backgroundColor: rawData.map((item, index) => 
          item.fill || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
        ),
        borderColor: rawData.map((item, index) => 
          item.fill || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                return {
                  text: `${label}: ${formatNumber(value)}`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatNumber(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} categories`}
      className={className}
    >
      <div style={{ position: 'relative', height: '400px', width: '100%' }}>
        <Pie data={chartData} options={options} />
      </div>
    </BaseChartWrapper>
  );
};

export default ChatPieChart;