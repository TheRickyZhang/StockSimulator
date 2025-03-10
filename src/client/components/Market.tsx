import React, { useContext } from 'react';
import { Container, Stack, Button, Title, Paper, Text } from '@mantine/core';
import { MarketContext } from '@context/MarketContext';
import cn from 'classnames';
import PriceChart from '@components/PriceChart';

const Market: React.FC = () => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { price, updates, running, startMarket, stopMarket, priceHistory } = market;

  return (
    <Container>
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
      <Paper withBorder p="md" radius="md" mt="md">
        <Title order={4}>Debug Logs</Title>
        {updates.length === 0 ? (
          <Text>No updates yet...</Text>
        ) : (
          updates.map((update, idx) => <Text key={idx}>{update}</Text>)
        )}
      </Paper>
    </Container>
  );
};

export default Market;
