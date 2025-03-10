// Home.tsx
import React, { useState } from 'react';
import { Container, Text } from '@mantine/core';
import SignIn from '@components/SignIn';
import Market from '@components/Market';
import Vote from '@components/Vote';
import { MarketProvider } from '@context/MarketContext';
import Portfolio from '@components/Portfolio';

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <Container>
      {/* Market is always visible */}
      <MarketProvider userName={userName}>
        <Market />
        <Portfolio />
        {!userName ? (
          <SignIn onSignIn={setUserName} />
        ) : (
          <>
            <Text>Welcome, {userName}!</Text>
            <Vote userName={userName} />
          </>
        )}
      </MarketProvider>
    </Container>
  );
};

export default Home;
