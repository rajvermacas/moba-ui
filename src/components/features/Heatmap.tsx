import React, { useMemo, ReactNode } from 'react';
import { DataQualityRecord, FilterState } from '@/types/dashboard.types';
import { filterData } from '../../lib/dataProcessor';
import { ChartContainer } from '../ui/ChartContainer';

interface HeatmapProps {
  data: DataQualityRecord[];
  filters: FilterState;
  filterPanel?: ReactNode;
}

interface HeatmapData {
  source: string;
  ruleType: string;
  failRate: number;
  count: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, filters, filterPanel }) => {
  const heatmapData = useMemo(() => {
    const filteredData = filterData(data, filters);
    
    if (filteredData.length === 0) {
      return [];
    }

    const grouped = filteredData.reduce((acc, record) => {
      const key = `${record.source}-${record.rule_type}`;
      if (!acc[key]) {
        acc[key] = {
          source: record.source,
          ruleType: record.rule_type,
          totalFail: 0,
          totalPass: 0,
          count: 0
        };
      }
      acc[key].totalFail += record.fail_count_1m;
      acc[key].totalPass += record.pass_count_1m;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      source: item.source,
      ruleType: item.ruleType,
      failRate: item.totalFail / (item.totalFail + item.totalPass),
      count: item.count
    })) as HeatmapData[];
  }, [data, filters]);

  const sources = useMemo(() => 
    Array.from(new Set(heatmapData.map(item => item.source))).sort(),
    [heatmapData]
  );

  const ruleTypes = useMemo(() => 
    Array.from(new Set(heatmapData.map(item => item.ruleType))).sort(),
    [heatmapData]
  );

  const getHeatmapValue = (source: string, ruleType: string) => {
    const item = heatmapData.find(d => d.source === source && d.ruleType === ruleType);
    return item ? item.failRate : 0;
  };

  const getColorIntensity = (failRate: number) => {
    // Red-based gradient scale from light to dark red
    if (failRate === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (failRate < 0.05) return 'bg-red-100 dark:bg-red-900/30';
    if (failRate < 0.1) return 'bg-red-200 dark:bg-red-800/50';
    if (failRate < 0.2) return 'bg-red-400 dark:bg-red-700/70';
    return 'bg-red-600 dark:bg-red-600 text-white';
  };

  return (
    <ChartContainer
      title="Data Quality Heatmap"
      description="Failure rates by source system and rule type"
      filters={filterPanel}
    >
      {heatmapData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : (
        <div className="overflow-auto h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="min-w-full">
            {/* Legend */}
            <div className="mb-4 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Failure Rate:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
                <div className="w-4 h-4 bg-red-200 dark:bg-red-800/50 rounded"></div>
                <div className="w-4 h-4 bg-red-400 dark:bg-red-700/70 rounded"></div>
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `150px repeat(${ruleTypes.length}, 100px)` }}>
              {/* Header row */}
              <div></div>
              {ruleTypes.map(ruleType => (
                <div key={ruleType} className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center p-2 border-b border-gray-200 dark:border-gray-600">
                  {ruleType}
                </div>
              ))}

              {/* Data rows */}
              {sources.map(source => (
                <React.Fragment key={source}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white p-2 truncate border-r border-gray-200 dark:border-gray-600">
                    {source}
                  </div>
                  {ruleTypes.map(ruleType => {
                    const failRate = getHeatmapValue(source, ruleType);
                    return (
                      <div
                        key={`${source}-${ruleType}`}
                        className={`h-16 border border-gray-200 dark:border-gray-600 rounded ${getColorIntensity(failRate)} flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer`}
                        title={`${source} - ${ruleType}: ${(failRate * 100).toFixed(1)}% failure rate`}
                      >
                        {failRate > 0 && (
                          <span className={`text-xs font-medium ${failRate >= 0.2 ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            {(failRate * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  );
};