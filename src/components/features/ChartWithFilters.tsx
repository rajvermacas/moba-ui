'use client';

import { ReactElement, cloneElement } from 'react';
import { FilterPanel } from './FilterPanel';
import { DataQualityRecord, FilterState } from '@/types/dashboard.types';

interface ChartWithFiltersProps {
  data: DataQualityRecord[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  children: ReactElement<any>;
}

export function ChartWithFilters({
  data,
  filters,
  onFiltersChange,
  children
}: ChartWithFiltersProps) {
  // Clone the chart component and inject the FilterPanel as a prop
  const chartWithFilters = cloneElement(children, {
    ...children.props,
    filters,
    filterPanel: (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <FilterPanel
          data={data}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </div>
    )
  });

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      {chartWithFilters}
    </div>
  );
}