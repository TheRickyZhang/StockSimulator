import React, { useContext } from 'react';
import { MarketContext } from '@context/MarketContext';

interface VoteProps {
  userName: string;
}

const Vote: React.FC<VoteProps> = ({ userName }) => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { voteCounts, sendVote, waitWarning } = market;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          border: '2px solid #3498db',
          padding: '16px',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>Vote</h3>
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            style={{ marginRight: '10px' }}
            onClick={() => sendVote('buy', userName)}
          >
            Buy
          </button>
          <button
            style={{ marginRight: '10px' }}
            onClick={() => sendVote('sell', userName)}
          >
            Sell
          </button>
          <button onClick={() => sendVote('hold', userName)}>Hold</button>
        </div>
        {waitWarning && (
          <p style={{ color: 'red', marginTop: '8px' }}>{waitWarning}</p>
        )}
        <div style={{ marginTop: '16px' }}>
          <p style={{ margin: 100 }}>Votes:</p>
          <p style={{ margin: 100 }}>Buy: {voteCounts.buy}</p>
          <p style={{ margin: 100 }}>Sell: {voteCounts.sell}</p>
          <p style={{ margin: 0 }}>Hold: {voteCounts.hold}</p>
        </div>
      </div>
    </div>
  );
};

export default Vote;
