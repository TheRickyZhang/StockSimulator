// Home.tsx
import React, { useState } from 'react';
import { Container, Text } from '@mantine/core';
import SignIn from '@components/SignIn';
import Market from '@components/Market';
import Portfolio from '@components/Portfolio';
import Vote from '@components/Vote';
import { MarketProvider } from '@context/MarketContext';

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <Container>
      <MarketProvider userName={userName}>
        {/* Flex container: left = Market, right = Portfolio + Vote/SignIn */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Left side */}
          <div style={{ flex: 2 }}>
            <Market />
          </div>

          {/* Right side */}
          <div style={{ flex: 1 }}>
            <Portfolio />
            {userName ? (
              <>
                <Text mt="md">Welcome, {userName}!</Text>
                <Vote userName={userName} />
              </>
            ) : (
              <SignIn onSignIn={setUserName} />
            )}
          </div>
        </div>
      </MarketProvider>
    </Container>
  );
};

export default Home;
