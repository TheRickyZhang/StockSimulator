import React, { useContext } from 'react';
import { Stack, Button, Title, Text } from '@mantine/core';
import { MarketContext } from '@context/MarketContext';

interface VoteProps {
  userName: string;
}

const Vote: React.FC<VoteProps> = ({ userName }) => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { voteCounts, sendVote, waitWarning } = market;
  console.log("waitWarning", waitWarning);

  return (
    <>
      <Title order={3}>Vote</Title>
      <Stack mt="md">
        <Button onClick={() => sendVote("buy", userName)}>Buy</Button>
        <Button onClick={() => sendVote("sell", userName)}>Sell</Button>
        <Button onClick={() => sendVote("hold", userName)}>Hold</Button>
      </Stack>
      {waitWarning && (
        <Text color="red" mt="sm">{waitWarning}</Text>
      )}
      <Text mt="md">Votes:</Text>
      <Text>Buy: {voteCounts.buy}</Text>
      <Text>Sell: {voteCounts.sell}</Text>
      <Text>Hold: {voteCounts.hold}</Text>
    </>
  );
};

export default Vote;
