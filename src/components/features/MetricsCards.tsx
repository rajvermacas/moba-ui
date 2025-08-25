import { DashboardMetrics } from '@/types/dashboard.types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  onTrendClick?: (trend: 'down' | 'up' | 'equal') => void;
}

export function MetricsCards({ metrics, onTrendClick }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Datasets',
      value: metrics.totalDatasets.toLocaleString(),
      icon: '📊',
      color: 'red',
      clickable: false
    },
    {
      title: 'Urgent Attention',
      value: metrics.urgentAttentionCount.toLocaleString(),
      icon: '🚨',
      color: 'red',
      clickable: false
    },
    {
      title: 'Avg Failure Rate',
      value: `${(metrics.averageFailRate * 100).toFixed(1)}%`,
      icon: '📋',
      color: 'gray',
      clickable: false
    },
    {
      title: 'Trending Up',
      value: metrics.trendingUp.toLocaleString(),
      icon: '📈',
      color: 'red',
      clickable: true,
      trend: 'up' as const
    },
    {
      title: 'Trending Flat',
      value: metrics.trendingFlat.toLocaleString(),
      icon: '➡️',
      color: 'yellow',
      clickable: true,
      trend: 'equal' as const
    },
    {
      title: 'Trending Down',
      value: metrics.trendingDown.toLocaleString(),
      icon: '📉',
      color: 'green',
      clickable: true,
      trend: 'down' as const
    }
  ];

  const getColorClasses = (color: string, clickable: boolean) => {
    const baseClasses = (() => {
      switch (color) {
        case 'red':
          return 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400';
        case 'green':
          return 'border-green-200 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400';
        case 'yellow':
          return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
        case 'blue':
          return 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400';
        default:
          return 'border-gray-200 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300';
      }
    })();
    
    const glassmorphism = 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg';
    
    if (clickable && onTrendClick) {
      return `${baseClasses} ${glassmorphism} cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-opacity-80 hover:bg-red-100 dark:hover:bg-red-800/40`;
    }
    
    return `${baseClasses} ${glassmorphism}`;
  };

  const handleCardClick = (card: any) => {
    if (card.clickable && card.trend && onTrendClick) {
      onTrendClick(card.trend);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`p-4 rounded-lg border ${getColorClasses(card.color, card.clickable)}`}
          onClick={() => handleCardClick(card)}
          role={card.clickable && onTrendClick ? "button" : undefined}
          tabIndex={card.clickable && onTrendClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (card.clickable && onTrendClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleCardClick(card);
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>
          {card.clickable && onTrendClick && (
            <div className="mt-2 text-xs opacity-60">
              Click to view trends
            </div>
          )}
        </div>
      ))}
    </div>
  );
}