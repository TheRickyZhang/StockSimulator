import React, { useState } from 'react';
import SignIn from '@components/SignIn';
import Market from '@components/Market';
import Portfolio from '@components/Portfolio';
import Vote from '@components/Vote';
import { MarketProvider } from '@context/MarketContext';

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <div style={{ padding: '16px' }}>
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
                <p style={{ marginTop: '16px' }}>Welcome, {userName}!</p>
                <Vote userName={userName} />
              </>
            ) : (
              <SignIn onSignIn={setUserName} />
            )}
          </div>
        </div>
      </MarketProvider>
    </div>
  );
};

export default Home;
