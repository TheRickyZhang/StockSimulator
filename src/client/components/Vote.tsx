import React, { useState, useContext } from 'react';
import { MarketContext } from '@context/MarketContext';
import { VOTE_WAIT_TIME } from '@shared/constants';

interface VoteProps {
  userName: string;
}

interface VoteButtonProps {
  voteType: "buy" | "sell" | "hold";
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

const VoteButton: React.FC<VoteButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '8px 16px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    >
      {children}
    </button>
  );
};


const Vote: React.FC<VoteProps> = ({ userName }) => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;
  const { voteCounts, sendVote, waitWarning } = market;

  const [disabled, setDisabled] = useState(false);
  const handleVote = (voteType: "buy" | "sell" | "hold") => {
    sendVote(voteType, userName);
    setDisabled(true);
    setTimeout(() => setDisabled(false), VOTE_WAIT_TIME);
  };
  const isButtonDisabled = disabled || !voteCounts || Boolean(waitWarning);

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
          <VoteButton
            voteType="buy"
            disabled={isButtonDisabled}
            onClick={() => handleVote('buy')}
          >
            Buy
          </VoteButton>
          <VoteButton
            voteType="sell"
            disabled={isButtonDisabled}
            onClick={() => handleVote('sell')}
          >
            Sell
          </VoteButton>
          <VoteButton
            voteType="hold"
            disabled={isButtonDisabled}
            onClick={() => handleVote('hold')}
          >
            Hold
          </VoteButton>
        </div>
        {waitWarning && (
          <p style={{ color: 'red', marginTop: '8px' }}>{waitWarning}</p>
        )}
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h4 style={{ marginBottom: '12px', textAlign: 'center' }}>Votes</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold' }}>Buy</p>
              <p>{voteCounts.buy}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold' }}>Sell</p>
              <p>{voteCounts.sell}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold' }}>Hold</p>
              <p>{voteCounts.hold}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
