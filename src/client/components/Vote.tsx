// Vote.tsx
import React, { useContext } from 'react';
import { Stack, Button, Title, Container, Text } from '@mantine/core';
import { MarketContext } from '@context/MarketContext';

interface VoteProps {
  userName: string;
}

const Vote: React.FC<VoteProps> = ({ userName }) => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { voteCounts, sendVote } = market;

  return (
    <>
      <Title order={3}>Vote</Title>
      <Stack mt="md">
        <Button onClick={() => sendVote("buy", userName)}>Buy</Button>
        <Button onClick={() => sendVote("sell", userName)}>Sell</Button>
        <Button onClick={() => sendVote("hold", userName)}>Hold</Button>
      </Stack>
      <Container>
        <Text>Votes:</Text>
        <Text>Buy: {voteCounts.buy}</Text>
        <Text>Sell: {voteCounts.sell}</Text>
        <Text>Hold: {voteCounts.hold}</Text>
      </Container>
    </>
  );
};

export default Vote;
