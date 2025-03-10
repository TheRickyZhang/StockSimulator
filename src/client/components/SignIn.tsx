// SignIn.tsx
import React, { useState } from 'react';
import { Button, TextInput, Stack } from '@mantine/core';

interface SignInProps {
  onSignIn: (name: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [name, setName] = useState('');

  return (
    <Stack gap={16}>
      <TextInput 
        label="Enter your name" 
        placeholder="John Doe" 
        value={name} 
        onChange={(e) => setName(e.currentTarget.value)} 
      />
      <Button onClick={() => onSignIn(name)} disabled={!name}>
        Sign In
      </Button>
    </Stack>
  );
};

export default SignIn;
