import React, { Suspense, lazy } from 'react';
import { GraphData } from '@/types/chat.types';
import { BaseChartWrapper } from './BaseChart';

// Lazy load chart components for better performance
const ChatBarChart = lazy(() => import('./ChatBarChart'));
const ChatLineChart = lazy(() => import('./ChatLineChart'));
const ChatPieChart = lazy(() => import('./ChatPieChart'));
const ChatScatterChart = lazy(() => import('./ChatScatterChart'));
const ChatAreaChart = lazy(() => import('./ChatAreaChart'));
const ChatHeatmap = lazy(() => import('./ChatHeatmap'));

interface ChatGraphRendererProps {
  graphData: GraphData | null | undefined;
  className?: string;
}

/**
 * Main component that routes to the appropriate chart type based on graphData.chart_type
 * Handles null graph data gracefully (backward compatibility)
 */
export const ChatGraphRenderer: React.FC<ChatGraphRendererProps> = ({ 
  graphData, 
  className 
}) => {
  // Handle null or undefined graph data (backward compatibility)
  if (!graphData) {
    return null;
  }

  // Validate basic structure
  if (!graphData.chart_type || !graphData.data || !Array.isArray(graphData.data)) {
    return (
      <BaseChartWrapper
        title="Chart Error"
        error="Invalid graph data structure received from server"
        className={className}
      />
    );
  }

  // Loading fallback component
  const ChartLoadingFallback = () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  );

  // Route to appropriate chart component based on chart_type
  const renderChart = () => {
    switch (graphData.chart_type) {
      case 'bar':
        return <ChatBarChart graphData={graphData} className={className} />;
      
      case 'line':
        return <ChatLineChart graphData={graphData} className={className} />;
      
      case 'pie':
        return <ChatPieChart graphData={graphData} className={className} />;
      
      case 'scatter':
        return <ChatScatterChart graphData={graphData} className={className} />;
      
      case 'area':
        return <ChatAreaChart graphData={graphData} className={className} />;
      
      case 'heatmap':
        return <ChatHeatmap graphData={graphData} className={className} />;
      
      default:
        return (
          <BaseChartWrapper
            title="Unsupported Chart Type"
            error={`Chart type '${graphData.chart_type}' is not supported`}
            className={className}
          />
        );
    }
  };

  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <div className="w-full mt-4">
        {renderChart()}
      </div>
    </Suspense>
  );
};

/**
 * Chart skeleton component for loading states
 */
export const ChatGraphSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-[400px] ${className}`}>
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        
        {/* Chart area skeleton */}
        <div className="h-[350px] bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between h-full">
            {/* Y-axis skeleton */}
            <div className="flex flex-col justify-between w-12">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              ))}
            </div>
            
            {/* Chart bars/lines skeleton */}
            <div className="flex-1 flex items-end justify-around px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gray-300 dark:bg-gray-600 rounded-t"
                  style={{
                    width: '15%',
                    height: `${20 + Math.random() * 60}%`
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* X-axis skeleton */}
          <div className="flex justify-around mt-4 px-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGraphRenderer;