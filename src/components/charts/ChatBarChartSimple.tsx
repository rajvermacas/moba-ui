import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Page A', uv: 4000 },
  { name: 'Page B', uv: 3000 },
  { name: 'Page C', uv: 2000 },
  { name: 'Page D', uv: 2780 },
  { name: 'Page E', uv: 1890 },
];

export const ChatBarChartSimple = () => {
  console.log('Simple chart data:', data);
  
  // Force numeric conversion
  const processedData = data.map(item => ({
    ...item,
    uv: Number(item.uv)
  }));
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
          type="number"
          domain={[0, 'dataMax']}
          ticks={[0, 1000, 2000, 3000, 4000]}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="uv" fill="#8884d8">
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};