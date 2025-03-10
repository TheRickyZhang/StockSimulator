import React, { useContext } from 'react';
import { MarketContext } from '@context/MarketContext';
import { Paper, Title, Text } from '@mantine/core';

const Portfolio: React.FC = () => {
  const market = useContext(MarketContext);
  if (!market) return null;

  const { cash, assets, price } = market;
  const netWorth = cash + assets * price;

  console.log("cash", cash);
  console.log("assets", assets);
  console.log("price", price);

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={4}>Portfolio</Title>
      <Text>Cash: ${cash?.toFixed(2)}</Text>
      <Text>Assets: {assets}</Text>
      <Text>Net Worth: ${netWorth.toFixed(2)}</Text>
    </Paper>
  );
};

export default Portfolio;
