import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { PricePoint } from '@context/MarketContext';

interface PriceChartProps {
  data: PricePoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartData = data.map(point => ({
    time: new Date(point.time).getTime(),
    price: point.price,
  }));

  let yDomain: [number, number] = [0, 100];
  if (chartData.length > 0) {
    const prices = chartData.map(point => point.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      yDomain = [minPrice - 1, maxPrice + 1];
    } else {
      const midPrice = (minPrice + maxPrice) / 2;
      const buffer = 0.1 * (maxPrice - midPrice);
      yDomain = [minPrice - buffer, maxPrice + buffer];
    }
  }

  return (
    <LineChart width={600} height={300} data={chartData}>
      <Line type="linear" dataKey="price" stroke="#8884d8" isAnimationActive={false} />
      <CartesianGrid stroke="#ccc" />
      <XAxis 
        dataKey="time" 
        tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} 
      />
      <YAxis 
        domain={yDomain} 
        tickFormatter={(value: number) => value.toFixed(2)}
      />
      <Tooltip labelFormatter={(label) => new Date(label).toLocaleTimeString()} />
    </LineChart>
  );
};

export default PriceChart;
