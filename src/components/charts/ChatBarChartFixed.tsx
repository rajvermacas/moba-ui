import React from 'react';
import { GraphData } from '@/types/chat.types';
import { BaseChartWrapper } from './BaseChart';

interface ChatBarChartFixedProps {
  graphData: GraphData;
  className?: string;
}

export const ChatBarChartFixed: React.FC<ChatBarChartFixedProps> = ({ graphData, className }) => {
  // Transform the data
  const data = graphData.data.map((item: any) => ({
    name: item.name || item[graphData.x_key || 'name'],
    value: parseFloat(item.value || item[graphData.y_key || 'value']) || 0,
    color: item.color || '#dc2626'
  }));

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = 300; // Height of chart area in pixels

  return (
    <BaseChartWrapper
      title={graphData.title}
      subtitle={`${graphData.total_records} records`}
      className={className}
    >
      <div style={{ width: '100%', height: '400px', padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-around',
          height: '300px',
          borderBottom: '2px solid #e5e7eb',
          borderLeft: '2px solid #e5e7eb',
          position: 'relative'
        }}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * scale;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: `${80 / data.length}%`,
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '60%',
                    height: `${barHeight}px`,
                    backgroundColor: item.color,
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  title={`${item.name}: ${item.value}`}
                >
                  <span style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#374151',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.value.toFixed(2)}
                  </span>
                </div>
                <span style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#6b7280',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '20px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '10px'
        }}>
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, i) => (
            <span key={i} style={{ fontSize: '10px', color: '#6b7280' }}>
              {val.toFixed(0)}
            </span>
          ))}
        </div>
      </div>
    </BaseChartWrapper>
  );
};

export default ChatBarChartFixed;