import { useState } from 'react';
import { UrgentAttentionItem } from '@/types/dashboard.types';

interface UrgentAttentionWidgetProps {
  items: UrgentAttentionItem[];
}

export function UrgentAttentionWidget({ items }: UrgentAttentionWidgetProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  
  const handleToggleView = () => {
    setShowAllItems(!showAllItems);
  };
  if (items.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent Attention Required</h2>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium px-2.5 py-0.5 rounded">
            All Clear
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center py-8">
          No datasets with high failure rates detected. All systems appear to be operating within acceptable parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent Attention Required</h2>
        <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-sm font-medium px-2.5 py-0.5 rounded">
          {items.length} {items.length === 1 ? 'Issue' : 'Issues'}
        </span>
      </div>
      
      <div className="space-y-3">
        {(showAllItems ? items : items.slice(0, 5)).map((item, index) => (
          <div
            key={`${item.dataset_name}-${item.source}-${index}`}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{item.dataset_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.source} • {item.dimension}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm font-medium text-red-800 dark:text-red-400">
                  {(item.fail_rate_1m * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">1M Failure Rate</div>
              </div>
            </div>
            
            <div className="mt-3 flex space-x-4 text-xs text-gray-600 dark:text-gray-400">
              <span>3M: {(item.fail_rate_3m * 100).toFixed(1)}%</span>
              <span>12M: {(item.fail_rate_12m * 100).toFixed(1)}%</span>
              <span className="text-red-600 dark:text-red-400 font-medium">⚠ High Failure Rate</span>
            </div>
          </div>
        ))}
        
        {items.length > 5 && (
          <div className="text-center py-2">
            <button 
              onClick={handleToggleView}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              aria-label={showAllItems ? 'Show fewer issues' : `View ${items.length - 5} more issues`}
            >
              {showAllItems 
                ? 'Show fewer issues ↑' 
                : `View ${items.length - 5} more issues →`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}