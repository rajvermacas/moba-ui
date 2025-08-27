import React, { useState } from 'react';
import { ChatGraphRenderer } from './ChatGraphRenderer';
import { GraphData } from '@/types/chat.types';

/**
 * Test panel for validating all chart types with sample data
 * This component is for development testing only
 */
export const ChartTestPanel: React.FC = () => {
  // Sample data for each chart type
  const sampleCharts: { [key: string]: GraphData } = {
    bar: {
      chart_type: 'bar',
      data: [
        { name: 'Electronics', value: 25000, color: '#dc2626' },
        { name: 'Clothing', value: 18000, color: '#ef4444' },
        { name: 'Books', value: 12000, color: '#f87171' },
        { name: 'Home & Garden', value: 8500, color: '#fca5a5' },
        { name: 'Sports', value: 6200, color: '#fecaca' }
      ],
      title: 'Sales by Product Category',
      x_key: 'name',
      y_key: 'value',
      x_label: 'Category',
      y_label: 'Sales ($)',
      generated_at: Date.now(),
      total_records: 5
    },
    line: {
      chart_type: 'line',
      data: [
        { x: '2023-06', y: 142000 },
        { x: '2023-07', y: 138000 },
        { x: '2023-08', y: 155000 },
        { x: '2023-09', y: 168000 },
        { x: '2023-10', y: 172000 },
        { x: '2023-11', y: 165000 }
      ],
      title: 'Monthly Revenue Trend',
      x_key: 'x',
      y_key: 'y',
      x_label: 'Month',
      y_label: 'Revenue ($)',
      stroke: '#dc2626',
      generated_at: Date.now(),
      total_records: 6
    },
    pie: {
      chart_type: 'pie',
      data: [
        { name: 'Premium', value: 245, fill: '#dc2626' },
        { name: 'Standard', value: 315, fill: '#ef4444' },
        { name: 'Basic', value: 140, fill: '#f87171' }
      ],
      title: 'Customer Distribution by Type',
      name_key: 'name',
      value_key: 'value',
      generated_at: Date.now(),
      total_records: 3
    },
    scatter: {
      chart_type: 'scatter',
      data: [
        { x: 25, y: 1200 },
        { x: 32, y: 2100 },
        { x: 28, y: 1650 },
        { x: 45, y: 3200 },
        { x: 38, y: 2800 },
        { x: 52, y: 3800 },
        { x: 35, y: 2400 },
        { x: 41, y: 3100 },
        { x: 29, y: 1800 },
        { x: 48, y: 3500 }
      ],
      title: 'Customer Age vs Lifetime Value',
      x_key: 'x',
      y_key: 'y',
      x_label: 'Age',
      y_label: 'Lifetime Value ($)',
      fill: '#dc2626',
      generated_at: Date.now(),
      total_records: 10
    },
    area: {
      chart_type: 'area',
      data: [
        { x: 'Q1 2023', y: 1250 },
        { x: 'Q2 2023', y: 1420 },
        { x: 'Q3 2023', y: 1680 },
        { x: 'Q4 2023', y: 1890 }
      ],
      title: 'Quarterly User Signup Growth',
      x_key: 'x',
      y_key: 'y',
      x_label: 'Quarter',
      y_label: 'New Signups',
      fill: '#dc2626',
      fillOpacity: 0.3,
      stroke: '#dc2626',
      generated_at: Date.now(),
      total_records: 4
    },
    heatmap: {
      chart_type: 'heatmap',
      data: [
        { x: 'Monday', y: 'Morning', value: 85 },
        { x: 'Monday', y: 'Afternoon', value: 72 },
        { x: 'Monday', y: 'Evening', value: 45 },
        { x: 'Tuesday', y: 'Morning', value: 95 },
        { x: 'Tuesday', y: 'Afternoon', value: 88 },
        { x: 'Tuesday', y: 'Evening', value: 52 },
        { x: 'Wednesday', y: 'Morning', value: 92 },
        { x: 'Wednesday', y: 'Afternoon', value: 85 },
        { x: 'Wednesday', y: 'Evening', value: 48 },
        { x: 'Thursday', y: 'Morning', value: 88 },
        { x: 'Thursday', y: 'Afternoon', value: 76 },
        { x: 'Thursday', y: 'Evening', value: 42 },
        { x: 'Friday', y: 'Morning', value: 82 },
        { x: 'Friday', y: 'Afternoon', value: 69 },
        { x: 'Friday', y: 'Evening', value: 38 }
      ],
      title: 'Website Traffic Heatmap',
      x_key: 'x',
      y_key: 'y',
      value_key: 'value',
      x_label: 'Day',
      y_label: 'Time Period',
      value_label: 'Visitors',
      generated_at: Date.now(),
      total_records: 15
    }
  };

  const [selectedChart, setSelectedChart] = useState<string>('bar');
  const [showNullTest, setShowNullTest] = useState(false);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Chart Component Test Panel
        </h1>
        
        {/* Chart Type Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.keys(sampleCharts).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedChart(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChart === type
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Chart
            </button>
          ))}
          <button
            onClick={() => setShowNullTest(!showNullTest)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showNullTest
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Test Null Data
          </button>
        </div>

        {/* Chart Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {showNullTest ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Testing Null Graph Data (Backward Compatibility)
              </h2>
              <ChatGraphRenderer graphData={null} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                ✓ Component should render nothing when graph data is null
              </p>
            </div>
          ) : (
            <ChatGraphRenderer graphData={sampleCharts[selectedChart]} />
          )}
        </div>

        {/* Data Preview */}
        {!showNullTest && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Raw Data Structure
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(sampleCharts[selectedChart], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartTestPanel;