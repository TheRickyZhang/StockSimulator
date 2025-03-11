import React, { useContext } from 'react';
import { MarketContext } from '@context/MarketContext';
import cn from 'classnames';
import PriceChart from '@components/PriceChart';

interface MarketProps {
  userName: string | null;
}

const Market: React.FC<MarketProps> = ({ userName }) => {
  const market = useContext(MarketContext);
  if (!market) return <div>Loading...</div>;

  const { wsReady, price, updates, running, startMarket, stopMarket, priceHistory } = market;

  return (
    <div>
      <h2>Market Simulator</h2>
      <p>Current Price: {price.toFixed(2)}</p>
      
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {userName === "admin" && (
          <button
            onClick={() => (running ? stopMarket() : startMarket())}
            disabled={!wsReady}
            className={cn('base-button', {
              'btn-stop': running,
              'btn-start': !running,
            })}
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {running ? 'Stop Market' : 'Start Market'}
          </button>
        )}
      </div>

      <div
        style={{
          border: '2px solid #3498db',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px'
        }}
      >
        <PriceChart data={priceHistory} />
      </div>

      <div
        style={{
          maxHeight: '100px',
          overflowY: 'auto',
          border: '1px solid rgb(0, 0, 0)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '16px',
          marginTop: '16px'
        }}
      >
        {updates.length === 0 ? (
          <p>No updates yet...</p>
        ) : (
          updates.slice(-4).map((update, idx) => <p key={idx}>{update}</p>)
        )}
      </div>
    </div>
  );
};

export default Market;
