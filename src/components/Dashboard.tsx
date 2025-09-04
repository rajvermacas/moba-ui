'use client';

import { useState, useRef } from 'react';
import { DataQualityRecord, DashboardMetrics, UrgentAttentionItem, FilterState } from '@/types/dashboard.types';
import { useTheme } from '@/contexts/ThemeContext';
import { MetricsCards } from '@/components/features/MetricsCards';
import { UrgentAttentionWidget } from '@/components/features/UrgentAttentionWidget';
import { TrendChart } from '@/components/features/TrendChart';
import { FilterPanel } from '@/components/features/FilterPanel';
import { Heatmap } from '@/components/features/Heatmap';
import { SystemHealthMatrix } from '@/components/features/SystemHealthMatrix';
import { AIQuerySection } from '@/components/features/AIQuerySection';
import { ChartWithFilters } from '@/components/features/ChartWithFilters';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface DashboardProps {
  data: DataQualityRecord[];
  metrics: DashboardMetrics;
  urgentItems: UrgentAttentionItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function Dashboard({ data, metrics, urgentItems, loading, error, onRetry }: DashboardProps) {
  const {} = useTheme();
  const [filters, setFilters] = useState<FilterState>({ interval: 'all' });
  const [activeView, setActiveView] = useState<'trends' | 'heatmap' | 'matrix'>('trends');
  const trendChartRef = useRef<HTMLDivElement>(null);

  const handleTrendClick = (trend: 'down' | 'up' | 'equal') => {
    // Set the trend filter
    const newFilters = {
      ...filters,
      trend_flag: [trend]
    };
    setFilters(newFilters);

    // Switch to trends view if not already active
    if (activeView !== 'trends') {
      setActiveView('trends');
    }

    // Scroll to the trend chart after a short delay to ensure the view has switched
    setTimeout(() => {
      if (trendChartRef.current) {
        trendChartRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Add a subtle flash effect to highlight the chart
        trendChartRef.current.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.5)';
        trendChartRef.current.style.transition = 'box-shadow 0.3s ease-in-out';
        
        setTimeout(() => {
          if (trendChartRef.current) {
            trendChartRef.current.style.boxShadow = '';
          }
        }, 1500);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center glass p-8 rounded-xl">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center glass p-8 rounded-xl">
          <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="glass border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Quality Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and analyze data quality metrics across systems</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Metrics Overview */}
          <MetricsCards metrics={metrics} onTrendClick={handleTrendClick} />

          {/* Urgent Attention Widget */}
          <UrgentAttentionWidget items={urgentItems} />

          {/* AI Query Section */}
          <AIQuerySection />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Panel */}
            <div className="lg:col-span-1">
              <FilterPanel
                data={data}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Main Visualization Area */}
            <div className="lg:col-span-3" ref={trendChartRef}>
              {/* View Selector */}
              <div className="glass rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Visualization</h2>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setActiveView('trends')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'trends' 
                          ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      📈 Trend Analysis
                    </button>
                    <button
                      onClick={() => setActiveView('heatmap')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'heatmap' 
                          ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      🔥 Heatmap
                    </button>
                    <button
                      onClick={() => setActiveView('matrix')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'matrix' 
                          ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      🎯 Health Matrix
                    </button>
                  </div>
                </div>
              </div>

              {/* Visualization Component */}
              {activeView === 'trends' && (
                <ChartWithFilters
                  data={data}
                  filters={filters}
                  onFiltersChange={setFilters}
                >
                  <ErrorBoundary componentName="TrendChart">
                    <TrendChart data={data} filters={filters} />
                  </ErrorBoundary>
                </ChartWithFilters>
              )}
              {activeView === 'heatmap' && (
                <ChartWithFilters
                  data={data}
                  filters={filters}
                  onFiltersChange={setFilters}
                >
                  <Heatmap data={data} filters={filters} />
                </ChartWithFilters>
              )}
              {activeView === 'matrix' && (
                <ChartWithFilters
                  data={data}
                  filters={filters}
                  onFiltersChange={setFilters}
                >
                  <SystemHealthMatrix data={data} filters={filters} />
                </ChartWithFilters>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}