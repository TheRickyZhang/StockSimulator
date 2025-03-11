// Portfolio.tsx
import React, { useContext } from 'react';
import { Paper, Title, Text } from '@mantine/core';
import { MarketContext } from '@context/MarketContext';

const Portfolio: React.FC = () => {
  const market = useContext(MarketContext);
  if (!market) return null;

  const { cash, assets, price } = market;
  const netWorth = cash + assets * price;

  return (
    <Paper withBorder p="md" radius="md" mt="md">
      <Title order={4}>Portfolio</Title>
      <Text>Cash: ${cash.toFixed(2)}</Text>
      <Text>Assets: {assets}</Text>
      <Text>Net Worth: ${netWorth.toFixed(2)}</Text>
    </Paper>
  );
};

export default Portfolio;
