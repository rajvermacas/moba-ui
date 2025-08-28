/**
 * Chart theme utilities for Chart.js components
 * Provides consistent theming across all chart types
 */

export interface ChartThemeColors {
  text: string;
  gridLines: string;
  tooltip: {
    background: string;
    text: string;
    border: string;
  };
  legend: {
    text: string;
  };
  axis: {
    text: string;
    line: string;
  };
  dataLabel: {
    text: string;
  };
}

/**
 * Get theme-aware colors for Chart.js
 */
export const getChartThemeColors = (isDark: boolean): ChartThemeColors => {
  if (isDark) {
    // Dark theme colors - ensure high contrast
    return {
      text: '#e5e7eb', // Light gray for general text
      gridLines: 'rgba(156, 163, 175, 0.2)', // Semi-transparent gray
      tooltip: {
        background: 'rgba(31, 41, 55, 0.95)', // Dark gray with opacity
        text: '#f3f4f6', // Near white
        border: '#4b5563', // Medium gray
      },
      legend: {
        text: '#d1d5db', // Light gray
      },
      axis: {
        text: '#d1d5db', // Light gray
        line: '#6b7280', // Medium gray
      },
      dataLabel: {
        text: '#f9fafb', // Almost white for maximum contrast
      },
    };
  } else {
    // Light theme colors
    return {
      text: '#374151', // Dark gray for general text
      gridLines: 'rgba(156, 163, 175, 0.2)', // Semi-transparent gray
      tooltip: {
        background: 'rgba(255, 255, 255, 0.95)', // White with opacity
        text: '#111827', // Near black
        border: '#e5e7eb', // Light gray
      },
      legend: {
        text: '#4b5563', // Medium dark gray
      },
      axis: {
        text: '#4b5563', // Medium dark gray
        line: '#9ca3af', // Light gray
      },
      dataLabel: {
        text: '#111827', // Near black for maximum contrast
      },
    };
  }
};

/**
 * Create base Chart.js options with theme support
 */
export const getBaseChartOptions = (isDark: boolean, overrides: any = {}) => {
  const colors = getChartThemeColors(isDark);
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: colors.legend.text,
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: colors.tooltip.background,
        titleColor: colors.tooltip.text,
        bodyColor: colors.tooltip.text,
        borderColor: colors.tooltip.border,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 4,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
      },
      ...overrides.plugins,
    },
    scales: overrides.scales || {},
    ...overrides,
  };
};

/**
 * Get theme-aware options for axes (for line, bar, area charts)
 */
export const getAxisOptions = (isDark: boolean) => {
  const colors = getChartThemeColors(isDark);
  
  return {
    x: {
      grid: {
        color: colors.gridLines,
        drawBorder: false,
      },
      ticks: {
        color: colors.axis.text,
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: colors.gridLines,
        drawBorder: false,
      },
      ticks: {
        color: colors.axis.text,
        font: {
          size: 11,
        },
      },
    },
  };
};

/**
 * Get theme-aware options specifically for pie/doughnut charts
 */
export const getPieChartOptions = (isDark: boolean, customOptions: any = {}) => {
  const colors = getChartThemeColors(isDark);
  
  return {
    ...getBaseChartOptions(isDark, {
      plugins: {
        ...customOptions.plugins,
        legend: {
          position: 'bottom' as const,
          labels: {
            color: colors.legend.text,
            font: {
              size: 12,
            },
            padding: 15,
            generateLabels: customOptions.plugins?.legend?.labels?.generateLabels,
          },
        },
        tooltip: {
          backgroundColor: colors.tooltip.background,
          titleColor: colors.tooltip.text,
          bodyColor: colors.tooltip.text,
          borderColor: colors.tooltip.border,
          borderWidth: 1,
          padding: 12,
          callbacks: customOptions.plugins?.tooltip?.callbacks,
        },
        // Data labels for pie charts
        datalabels: {
          color: colors.dataLabel.text,
          font: {
            weight: 'bold' as const,
            size: 12,
          },
          formatter: (value: any, context: any) => {
            // Show percentage
            const sum = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return percentage > 5 ? `${percentage}%` : ''; // Hide small percentages
          },
        },
      },
    }),
  };
};

/**
 * Get theme-aware options for bar charts
 */
export const getBarChartOptions = (isDark: boolean, customOptions: any = {}) => {
  return {
    ...getBaseChartOptions(isDark, {
      ...customOptions,
      scales: {
        ...getAxisOptions(isDark),
        ...customOptions.scales,
      },
    }),
  };
};

/**
 * Get theme-aware options for line/area charts
 */
export const getLineChartOptions = (isDark: boolean, customOptions: any = {}) => {
  const colors = getChartThemeColors(isDark);
  
  return {
    ...getBaseChartOptions(isDark, {
      ...customOptions,
      scales: {
        ...getAxisOptions(isDark),
        ...customOptions.scales,
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
          backgroundColor: isDark ? colors.dataLabel.text : colors.text,
        },
      },
    }),
  };
};

/**
 * Get theme-aware options for scatter charts
 */
export const getScatterChartOptions = (isDark: boolean, customOptions: any = {}) => {
  const colors = getChartThemeColors(isDark);
  
  return {
    ...getBaseChartOptions(isDark, {
      ...customOptions,
      scales: {
        ...getAxisOptions(isDark),
        ...customOptions.scales,
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: isDark ? colors.dataLabel.text : colors.text,
        },
      },
    }),
  };
};