// Market.tsx
import React, { useContext } from 'react';
import { Stack, Button, Title, Paper, Text } from '@mantine/core';
import { MarketContext } from '@context/MarketContext';
import cn from 'classnames';
import PriceChart from '@components/PriceChart';

const Market: React.FC = () => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { price, updates, running, startMarket, stopMarket, priceHistory } = market;

  return (
    <>
      <Title order={2}>Market Simulator</Title>
      <Text>Current Price: {price.toFixed(2)}</Text>
      <Stack mt="md">
        <Button
          onClick={running ? stopMarket : startMarket}
          className={cn('base-button', {
            'btn-stop': running,
            'btn-start': !running,
          })}
        >
          {running ? 'Stop Market' : 'Start Market'}
        </Button>
      </Stack>

      {/* Chart Section */}
      <Paper withBorder p="md" radius="md" mt="md">
        <PriceChart data={priceHistory} />
      </Paper>

      {/* Debug Log Section */}
      <Paper
        style={{
          maxHeight: '100px',
          overflowY: 'auto',
          border: '1px solid rgb(0, 0, 0)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '16px',
        }}
      >
        {updates.length === 0 ? (
          <Text>No updates yet...</Text>
        ) : (
          updates.slice(-4).map((update, idx) => <Text key={idx}>{update}</Text>)
        )}
      </Paper>
    </>
  );
};

export default Market;
