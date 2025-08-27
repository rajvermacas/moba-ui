import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaseChartWrapper, validateChartData, formatNumber, DEFAULT_CHART_COLORS } from '../BaseChart';

describe('BaseChart', () => {
  describe('BaseChartWrapper', () => {
    it('renders children when no error', () => {
      render(
        <BaseChartWrapper>
          <div data-testid="chart-content">Chart Content</div>
        </BaseChartWrapper>
      );
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('renders loading state when loading prop is true', () => {
      render(<BaseChartWrapper loading={true} />);
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });

    it('renders error state when error prop is provided', () => {
      const errorMessage = 'Failed to load chart data';
      render(<BaseChartWrapper error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <BaseChartWrapper title="Test Chart Title">
          <div>Content</div>
        </BaseChartWrapper>
      );
      expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <BaseChartWrapper subtitle="Test subtitle">
          <div>Content</div>
        </BaseChartWrapper>
      );
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <BaseChartWrapper className="custom-class">
          <div>Content</div>
        </BaseChartWrapper>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('does not render children when loading', () => {
      render(
        <BaseChartWrapper loading={true}>
          <div data-testid="chart-content">Should not render</div>
        </BaseChartWrapper>
      );
      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });

    it('does not render children when error exists', () => {
      render(
        <BaseChartWrapper error="Error occurred">
          <div data-testid="chart-content">Should not render</div>
        </BaseChartWrapper>
      );
      expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
    });
  });

  describe('validateChartData', () => {
    it('returns null for valid data', () => {
      const data = [
        { name: 'Category 1', value: 100 },
        { name: 'Category 2', value: 200 }
      ];
      const result = validateChartData(data, ['name', 'value']);
      expect(result).toBeNull();
    });

    it('returns error for non-array data', () => {
      const result = validateChartData('invalid' as any, ['name', 'value']);
      expect(result).toBe('Invalid data format: expected array');
    });

    it('returns error for null data', () => {
      const result = validateChartData(null as any, ['name', 'value']);
      expect(result).toBe('Invalid data format: expected array');
    });

    it('returns error for empty array', () => {
      const result = validateChartData([], ['name', 'value']);
      expect(result).toBe('No data available to display');
    });

    it('returns error for missing required keys', () => {
      const data = [{ name: 'Category 1' }]; // missing 'value' key
      const result = validateChartData(data, ['name', 'value']);
      expect(result).toBe('Missing required data fields: value');
    });

    it('returns error for non-numeric values in numeric fields', () => {
      const data = [{ name: 'Category 1', value: 'not a number' }];
      const result = validateChartData(data, ['name', 'value']);
      expect(result).toBe("Field 'value' must contain numeric values");
    });

    it('allows string values for x field when appropriate', () => {
      const data = [{ x: 'January', y: 100 }];
      const result = validateChartData(data, ['x', 'y']);
      expect(result).toBeNull();
    });

    it('validates numeric x field correctly', () => {
      const data = [{ x: 10, y: 100 }];
      const result = validateChartData(data, ['x', 'y']);
      expect(result).toBeNull();
    });
  });

  describe('formatNumber', () => {
    it('formats numbers less than 1000 with locale string', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(0)).toBe('0');
    });

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('formats millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(10500000)).toBe('10.5M');
    });
  });

  describe('DEFAULT_CHART_COLORS', () => {
    it('contains 10 color values', () => {
      expect(DEFAULT_CHART_COLORS).toHaveLength(10);
    });

    it('contains valid hex color codes', () => {
      DEFAULT_CHART_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('starts with red-600 color', () => {
      expect(DEFAULT_CHART_COLORS[0]).toBe('#dc2626');
    });
  });

  describe('ChartErrorBoundary', () => {
    // Mock console.error for error boundary tests
    const originalConsoleError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });
    afterEach(() => {
      console.error = originalConsoleError;
    });

    const ThrowError = () => {
      throw new Error('Test error');
    };

    it('catches errors and displays fallback UI', () => {
      render(
        <BaseChartWrapper>
          <ThrowError />
        </BaseChartWrapper>
      );
      
      expect(screen.getByText('Chart Rendering Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders children when no error occurs', () => {
      render(
        <BaseChartWrapper>
          <div data-testid="working-component">Working Component</div>
        </BaseChartWrapper>
      );
      
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByText('Chart Rendering Error')).not.toBeInTheDocument();
    });

    it('calls onError callback when error occurs', () => {
      const onError = jest.fn();
      
      render(
        <BaseChartWrapper onError={onError}>
          <ThrowError />
        </BaseChartWrapper>
      );
      
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});