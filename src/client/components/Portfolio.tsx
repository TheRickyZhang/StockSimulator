import React, { useContext } from 'react';
import { MarketContext } from '@context/MarketContext';

const Portfolio: React.FC = () => {
  const market = useContext(MarketContext);
  if (!market) return null;

  const { cash, assets, price } = market;
  const netWorth = cash + assets * price;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
      <div
        style={{
          border: '2px solid #3498db',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#f0f8ff',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h4 style={{ margin: 0 }}>Portfolio</h4>
        <p style={{ margin: '8px 0' }}>Cash: ${cash.toFixed(2)}</p>
        <p style={{ margin: '8px 0' }}>Assets: {assets}</p>
        <p style={{ margin: '8px 0' }}>Net Worth: ${netWorth.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Portfolio;
