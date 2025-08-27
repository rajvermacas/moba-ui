import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatGraphRenderer, ChatGraphSkeleton } from '../ChatGraphRenderer';
import { GraphData } from '@/types/chat.types';

// Mock the individual chart components
jest.mock('../ChatBarChart', () => ({
  default: ({ graphData }: any) => <div data-testid="bar-chart">{graphData.title}</div>
}));

jest.mock('../ChatLineChart', () => ({
  default: ({ graphData }: any) => <div data-testid="line-chart">{graphData.title}</div>
}));

jest.mock('../ChatPieChart', () => ({
  default: ({ graphData }: any) => <div data-testid="pie-chart">{graphData.title}</div>
}));

jest.mock('../ChatScatterChart', () => ({
  default: ({ graphData }: any) => <div data-testid="scatter-chart">{graphData.title}</div>
}));

jest.mock('../ChatAreaChart', () => ({
  default: ({ graphData }: any) => <div data-testid="area-chart">{graphData.title}</div>
}));

jest.mock('../ChatHeatmap', () => ({
  default: ({ graphData }: any) => <div data-testid="heatmap-chart">{graphData.title}</div>
}));

describe('ChatGraphRenderer', () => {
  const mockBarData: GraphData = {
    chart_type: 'bar',
    data: [{ name: 'Test', value: 100 }],
    title: 'Test Bar Chart',
    x_key: 'name',
    y_key: 'value',
    generated_at: Date.now(),
    total_records: 1
  };

  const mockLineData: GraphData = {
    chart_type: 'line',
    data: [{ x: 'Jan', y: 100 }],
    title: 'Test Line Chart',
    x_key: 'x',
    y_key: 'y',
    generated_at: Date.now(),
    total_records: 1
  };

  const mockPieData: GraphData = {
    chart_type: 'pie',
    data: [{ name: 'Slice', value: 100, fill: '#ff0000' }],
    title: 'Test Pie Chart',
    name_key: 'name',
    value_key: 'value',
    generated_at: Date.now(),
    total_records: 1
  };

  const mockScatterData: GraphData = {
    chart_type: 'scatter',
    data: [{ x: 10, y: 20 }],
    title: 'Test Scatter Chart',
    x_key: 'x',
    y_key: 'y',
    generated_at: Date.now(),
    total_records: 1
  };

  const mockAreaData: GraphData = {
    chart_type: 'area',
    data: [{ x: 'Q1', y: 100 }],
    title: 'Test Area Chart',
    x_key: 'x',
    y_key: 'y',
    generated_at: Date.now(),
    total_records: 1
  };

  const mockHeatmapData: GraphData = {
    chart_type: 'heatmap',
    data: [{ x: 'Mon', y: 'Morning', value: 10 }],
    title: 'Test Heatmap',
    x_key: 'x',
    y_key: 'y',
    value_key: 'value',
    generated_at: Date.now(),
    total_records: 1
  };

  describe('Chart Type Routing', () => {
    it('renders bar chart for bar type', async () => {
      render(<ChatGraphRenderer graphData={mockBarData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
      });
    });

    it('renders line chart for line type', async () => {
      render(<ChatGraphRenderer graphData={mockLineData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
      });
    });

    it('renders pie chart for pie type', async () => {
      render(<ChatGraphRenderer graphData={mockPieData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
      });
    });

    it('renders scatter chart for scatter type', async () => {
      render(<ChatGraphRenderer graphData={mockScatterData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Scatter Chart')).toBeInTheDocument();
      });
    });

    it('renders area chart for area type', async () => {
      render(<ChatGraphRenderer graphData={mockAreaData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Area Chart')).toBeInTheDocument();
      });
    });

    it('renders heatmap for heatmap type', async () => {
      render(<ChatGraphRenderer graphData={mockHeatmapData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
        expect(screen.getByText('Test Heatmap')).toBeInTheDocument();
      });
    });
  });

  describe('Null Data Handling (Backward Compatibility)', () => {
    it('returns null when graphData is null', () => {
      const { container } = render(<ChatGraphRenderer graphData={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when graphData is undefined', () => {
      const { container } = render(<ChatGraphRenderer graphData={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('shows error for invalid chart type', async () => {
      const invalidData: any = {
        chart_type: 'invalid',
        data: [{ x: 1, y: 2 }],
        title: 'Invalid Chart',
        generated_at: Date.now(),
        total_records: 1
      };

      render(<ChatGraphRenderer graphData={invalidData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Unsupported Chart Type')).toBeInTheDocument();
        expect(screen.getByText("Chart type 'invalid' is not supported")).toBeInTheDocument();
      });
    });

    it('shows error for missing chart type', () => {
      const invalidData: any = {
        data: [{ x: 1, y: 2 }],
        title: 'No Type Chart',
        generated_at: Date.now(),
        total_records: 1
      };

      render(<ChatGraphRenderer graphData={invalidData} />);
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid graph data structure received from server')).toBeInTheDocument();
    });

    it('shows error for missing data array', () => {
      const invalidData: any = {
        chart_type: 'bar',
        title: 'No Data Chart',
        generated_at: Date.now(),
        total_records: 0
      };

      render(<ChatGraphRenderer graphData={invalidData} />);
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid graph data structure received from server')).toBeInTheDocument();
    });

    it('shows error for non-array data', () => {
      const invalidData: any = {
        chart_type: 'bar',
        data: 'not an array',
        title: 'Invalid Data Chart',
        generated_at: Date.now(),
        total_records: 0
      };

      render(<ChatGraphRenderer graphData={invalidData} />);
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid graph data structure received from server')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while chart is loading', () => {
      render(<ChatGraphRenderer graphData={mockBarData} />);
      
      // The loading state appears briefly before the lazy-loaded component
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to wrapper', async () => {
      const { container } = render(
        <ChatGraphRenderer graphData={mockBarData} className="custom-chart-class" />
      );
      
      await waitFor(() => {
        const wrapper = container.querySelector('.custom-chart-class');
        expect(wrapper).toBeInTheDocument();
      });
    });
  });
});

describe('ChatGraphSkeleton', () => {
  it('renders skeleton with animation', () => {
    render(<ChatGraphSkeleton />);
    
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders title skeleton', () => {
    const { container } = render(<ChatGraphSkeleton />);
    
    const titleSkeleton = container.querySelector('.h-6.bg-gray-200');
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('renders chart area skeleton', () => {
    const { container } = render(<ChatGraphSkeleton />);
    
    const chartSkeleton = container.querySelector('.h-\\[350px\\]');
    expect(chartSkeleton).toBeInTheDocument();
  });

  it('renders bar placeholders', () => {
    const { container } = render(<ChatGraphSkeleton />);
    
    const bars = container.querySelectorAll('.bg-gray-300');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<ChatGraphSkeleton className="custom-skeleton" />);
    
    const skeleton = container.querySelector('.custom-skeleton');
    expect(skeleton).toBeInTheDocument();
  });
});