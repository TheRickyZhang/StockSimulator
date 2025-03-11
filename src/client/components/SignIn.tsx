import React, { useState } from 'react';

interface SignInProps {
  onSignIn: (name: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [name, setName] = useState('');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
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
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="nameInput"
            style={{ display: 'block', marginBottom: '8px', textAlign: 'center' }}
          >
            Enter your name
          </label>
          <input
            id="nameInput"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            style={{
              width: '100%',
              padding: '8px',
              boxSizing: 'border-box',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>
        <button
          onClick={() => onSignIn(name)}
          disabled={!name}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: !name ? 'not-allowed' : 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignIn;
