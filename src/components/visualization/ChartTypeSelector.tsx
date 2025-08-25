/**
 * Chart type selector component
 */

import React from 'react';
import { ChartTypeSelectorProps, ChartType } from '@/types/visualization.types';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  AreaChart as AreaChartIcon,
  ScatterChart,
  Grid3X3
} from 'lucide-react';

const CHART_ICONS: Record<ChartType, React.ComponentType<any>> = {
  bar: BarChart3,
  line: LineChartIcon,
  pie: PieChartIcon,
  area: AreaChartIcon,
  scatter: ScatterChart,
  heatmap: Grid3X3
};

const CHART_LABELS: Record<ChartType, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  area: 'Area Chart',
  scatter: 'Scatter Plot',
  heatmap: 'Heatmap'
};

const CHART_DESCRIPTIONS: Record<ChartType, string> = {
  bar: 'Compare values across categories',
  line: 'Show trends over time or continuous data',
  pie: 'Display proportions of a whole',
  area: 'Show cumulative values over time',
  scatter: 'Explore relationships between variables',
  heatmap: 'Visualize data intensity in a matrix'
};

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  currentType,
  availableTypes,
  onTypeChange,
  disabled = false,
  className = ''
}) => {
  const handleTypeSelect = (type: ChartType) => {
    if (!disabled && type !== currentType) {
      onTypeChange(type);
    }
  };

  return (
    <div className={`chart-type-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chart Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {availableTypes.map((type) => {
            const IconComponent = CHART_ICONS[type];
            const isSelected = type === currentType;
            const isDisabled = disabled;
            
            return (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                disabled={isDisabled}
                className={`
                  group relative p-3 rounded-lg border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                  }
                  ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-red-300 dark:hover:border-red-600 hover:bg-red-25 dark:hover:bg-red-900/10 cursor-pointer'
                  }
                  backdrop-blur-sm
                `}
                title={`${CHART_LABELS[type]}: ${CHART_DESCRIPTIONS[type]}`}
              >
                <div className="flex flex-col items-center text-center">
                  <IconComponent 
                    size={24} 
                    className={`mb-1 transition-colors ${
                      isSelected 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
                    }`} 
                  />
                  <span className="text-xs font-medium leading-tight">
                    {CHART_LABELS[type]}
                  </span>
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description for selected chart type */}
      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            {React.createElement(CHART_ICONS[currentType], { size: 16 })}
          </div>
          <div>
            <div className="font-medium text-gray-700 dark:text-gray-300">
              {CHART_LABELS[currentType]}
            </div>
            <div className="mt-1">
              {CHART_DESCRIPTIONS[currentType]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};