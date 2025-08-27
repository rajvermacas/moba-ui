import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraphData } from '@/types/chat.types';
import ChatBarChart from '../ChatBarChart';
import ChatLineChart from '../ChatLineChart';
import ChatPieChart from '../ChatPieChart';
import ChatScatterChart from '../ChatScatterChart';
import ChatAreaChart from '../ChatAreaChart';
import ChatHeatmap from '../ChatHeatmap';

// Mock Recharts components since they don't work well in test environment
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart-component">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart-component">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart-component">{children}</div>,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart-component">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart-component">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Pie: () => <div data-testid="pie" />,
  Scatter: () => <div data-testid="scatter" />,
  Area: () => <div data-testid="area" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('Chart Components', () => {
  describe('ChatBarChart', () => {
    const validBarData: GraphData = {
      chart_type: 'bar',
      data: [
        { name: 'Category A', value: 100 },
        { name: 'Category B', value: 200 }
      ],
      title: 'Test Bar Chart',
      x_key: 'name',
      y_key: 'value',
      x_label: 'Categories',
      y_label: 'Values',
      generated_at: Date.now(),
      total_records: 2
    };

    it('renders bar chart with valid data', () => {
      render(<ChatBarChart graphData={validBarData} />);
      
      expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
      expect(screen.getByText('2 records')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart-component')).toBeInTheDocument();
    });

    it('shows error with invalid data', () => {
      const invalidData: GraphData = {
        ...validBarData,
        data: []
      };
      
      render(<ChatBarChart graphData={invalidData} />);
      expect(screen.getByText('No data available to display')).toBeInTheDocument();
    });

    it('shows error with missing required fields', () => {
      const invalidData: GraphData = {
        ...validBarData,
        data: [{ name: 'Test' }] as any // missing 'value' field
      };
      
      render(<ChatBarChart graphData={invalidData} />);
      expect(screen.getByText('Missing required data fields: value')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ChatBarChart graphData={validBarData} className="custom-bar-chart" />
      );
      
      expect(container.querySelector('.custom-bar-chart')).toBeInTheDocument();
    });
  });

  describe('ChatLineChart', () => {
    const validLineData: GraphData = {
      chart_type: 'line',
      data: [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 150 }
      ],
      title: 'Test Line Chart',
      x_key: 'x',
      y_key: 'y',
      x_label: 'Month',
      y_label: 'Value',
      stroke: '#ff0000',
      generated_at: Date.now(),
      total_records: 2
    };

    it('renders line chart with valid data', () => {
      render(<ChatLineChart graphData={validLineData} />);
      
      expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
      expect(screen.getByText('2 records')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart-component')).toBeInTheDocument();
    });

    it('shows error with empty data', () => {
      const invalidData: GraphData = {
        ...validLineData,
        data: []
      };
      
      render(<ChatLineChart graphData={invalidData} />);
      expect(screen.getByText('No data available to display')).toBeInTheDocument();
    });

    it('validates numeric y values', () => {
      const invalidData: GraphData = {
        ...validLineData,
        data: [{ x: 'Jan', y: 'not a number' }] as any
      };
      
      render(<ChatLineChart graphData={invalidData} />);
      expect(screen.getByText("Field 'y' must contain numeric values")).toBeInTheDocument();
    });
  });

  describe('ChatPieChart', () => {
    const validPieData: GraphData = {
      chart_type: 'pie',
      data: [
        { name: 'Slice A', value: 30, fill: '#ff0000' },
        { name: 'Slice B', value: 70, fill: '#00ff00' }
      ],
      title: 'Test Pie Chart',
      name_key: 'name',
      value_key: 'value',
      generated_at: Date.now(),
      total_records: 2
    };

    it('renders pie chart with valid data', () => {
      render(<ChatPieChart graphData={validPieData} />);
      
      expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('2 categories')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart-component')).toBeInTheDocument();
    });

    it('shows error with missing name field', () => {
      const invalidData: GraphData = {
        ...validPieData,
        data: [{ value: 100, fill: '#ff0000' }] as any
      };
      
      render(<ChatPieChart graphData={invalidData} />);
      expect(screen.getByText('Missing required data fields: name')).toBeInTheDocument();
    });
  });

  describe('ChatScatterChart', () => {
    const validScatterData: GraphData = {
      chart_type: 'scatter',
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 30 }
      ],
      title: 'Test Scatter Chart',
      x_key: 'x',
      y_key: 'y',
      x_label: 'X Values',
      y_label: 'Y Values',
      fill: '#0000ff',
      generated_at: Date.now(),
      total_records: 2
    };

    it('renders scatter chart with valid data', () => {
      render(<ChatScatterChart graphData={validScatterData} />);
      
      expect(screen.getByText('Test Scatter Chart')).toBeInTheDocument();
      expect(screen.getByText('2 data points')).toBeInTheDocument();
      expect(screen.getByTestId('scatter-chart-component')).toBeInTheDocument();
    });

    it('validates numeric x and y values', () => {
      const invalidData: GraphData = {
        ...validScatterData,
        data: [{ x: 'not a number', y: 20 }] as any
      };
      
      render(<ChatScatterChart graphData={invalidData} />);
      expect(screen.getByText("Field 'x' must contain numeric values")).toBeInTheDocument();
    });
  });

  describe('ChatAreaChart', () => {
    const validAreaData: GraphData = {
      chart_type: 'area',
      data: [
        { x: 'Q1', y: 1000 },
        { x: 'Q2', y: 1500 }
      ],
      title: 'Test Area Chart',
      x_key: 'x',
      y_key: 'y',
      x_label: 'Quarter',
      y_label: 'Revenue',
      fill: '#ff00ff',
      fillOpacity: 0.5,
      stroke: '#ff00ff',
      generated_at: Date.now(),
      total_records: 2
    };

    it('renders area chart with valid data', () => {
      render(<ChatAreaChart graphData={validAreaData} />);
      
      expect(screen.getByText('Test Area Chart')).toBeInTheDocument();
      expect(screen.getByText('2 records')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart-component')).toBeInTheDocument();
    });

    it('shows error with invalid y values', () => {
      const invalidData: GraphData = {
        ...validAreaData,
        data: [{ x: 'Q1', y: null }] as any
      };
      
      render(<ChatAreaChart graphData={invalidData} />);
      expect(screen.getByText("Field 'y' must contain numeric values")).toBeInTheDocument();
    });
  });

  describe('ChatHeatmap', () => {
    const validHeatmapData: GraphData = {
      chart_type: 'heatmap',
      data: [
        { x: 'Mon', y: 'Morning', value: 10 },
        { x: 'Mon', y: 'Evening', value: 5 },
        { x: 'Tue', y: 'Morning', value: 15 }
      ],
      title: 'Test Heatmap',
      x_key: 'x',
      y_key: 'y',
      value_key: 'value',
      x_label: 'Day',
      y_label: 'Time',
      value_label: 'Count',
      generated_at: Date.now(),
      total_records: 3
    };

    it('renders heatmap with valid data', () => {
      render(<ChatHeatmap graphData={validHeatmapData} />);
      
      expect(screen.getByText('Test Heatmap')).toBeInTheDocument();
      expect(screen.getByText('3 data points')).toBeInTheDocument();
      expect(screen.getByText('Day')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('shows error with missing value field', () => {
      const invalidData: GraphData = {
        ...validHeatmapData,
        data: [{ x: 'Mon', y: 'Morning' }] as any
      };
      
      render(<ChatHeatmap graphData={invalidData} />);
      expect(screen.getByText('Missing required data fields: value')).toBeInTheDocument();
    });

    it('creates heatmap grid correctly', () => {
      render(<ChatHeatmap graphData={validHeatmapData} />);
      
      // Check for axis labels
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Morning')).toBeInTheDocument();
      expect(screen.getByText('Evening')).toBeInTheDocument();
    });

    it('displays value labels', () => {
      render(<ChatHeatmap graphData={validHeatmapData} />);
      
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders color scale legend', () => {
      render(<ChatHeatmap graphData={validHeatmapData} />);
      
      expect(screen.getByText('Count: 5')).toBeInTheDocument(); // min value
      expect(screen.getByText('15')).toBeInTheDocument(); // max value
    });
  });

  describe('Common Chart Features', () => {
    const chartComponents = [
      { Component: ChatBarChart, name: 'BarChart', data: { name: 'Test', value: 100 } },
      { Component: ChatLineChart, name: 'LineChart', data: { x: 'Test', y: 100 } },
      { Component: ChatPieChart, name: 'PieChart', data: { name: 'Test', value: 100, fill: '#000' } },
      { Component: ChatScatterChart, name: 'ScatterChart', data: { x: 10, y: 20 } },
      { Component: ChatAreaChart, name: 'AreaChart', data: { x: 'Test', y: 100 } }
    ];

    chartComponents.forEach(({ Component, name, data }) => {
      describe(`${name} common features`, () => {
        const graphData: GraphData = {
          chart_type: name.toLowerCase().replace('chart', '') as any,
          data: [data],
          title: `Test ${name}`,
          x_key: 'x' in data ? 'x' : 'name',
          y_key: 'y' in data ? 'y' : 'value',
          name_key: 'name' in data ? 'name' : undefined,
          value_key: 'value' in data ? 'value' : undefined,
          generated_at: Date.now(),
          total_records: 1
        };

        it('handles null data gracefully', () => {
          const nullData: GraphData = {
            ...graphData,
            data: null as any
          };
          
          render(<Component graphData={nullData} />);
          expect(screen.getByText('Invalid data format: expected array')).toBeInTheDocument();
        });

        it('handles undefined data gracefully', () => {
          const undefinedData: GraphData = {
            ...graphData,
            data: undefined as any
          };
          
          render(<Component graphData={undefinedData} />);
          expect(screen.getByText('Invalid data format: expected array')).toBeInTheDocument();
        });

        it('displays title and record count', () => {
          render(<Component graphData={graphData} />);
          expect(screen.getByText(`Test ${name}`)).toBeInTheDocument();
        });
      });
    });
  });
});