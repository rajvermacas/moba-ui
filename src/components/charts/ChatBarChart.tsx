import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GraphData } from '@/types/chat.types';
import { BaseChartWrapper, validateChartData } from './BaseChart';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChatBarChartProps {
  graphData: GraphData;
  className?: string;
}

/**
 * Bar chart component for chat graph visualizations using Chart.js
 */
export const ChatBarChart: React.FC<ChatBarChartProps> = ({ graphData, className }) => {
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

  // Extract data for Chart.js
  const xKey = graphData.x_key || 'name';
  const yKey = graphData.y_key || 'value';
  
  const labels = graphData.data.map((item: any) => 
    String(item[xKey] || item.name)
  );
  
  const values = graphData.data.map((item: any) => {
    const val = item[yKey] || item.value;
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  });

  // Extract colors if provided
  const backgroundColors = graphData.data.map((item: any) => 
    item.color || '#dc2626'
  );

  // Chart.js data configuration
  const data = {
    labels: labels,
    datasets: [
      {
        label: graphData.y_label || 'Value',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map((color: string) => color),
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            // Format as currency if it looks like a price
            if (value > 0) {
              return `${label}: $${value.toFixed(2)}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            // Format Y-axis labels as currency
            return '$' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: graphData.y_label || 'Value'
        }
      }
    }
  };

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <div style={{ width: '100%', height: '400px' }}>
        <Bar data={data} options={options} />
      </div>
    </BaseChartWrapper>
  );
};

export default ChatBarChart;