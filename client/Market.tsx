import React, { useState, useEffect } from 'react';
import { Container, Stack, TextInput, Button, Title, Paper, Text } from '@mantine/core';

const Market: React.FC = () => {
    const [userName, setUserName] = useState<string>("");
    const [joined, setJoined] = useState<boolean>(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [marketUpdates, setMarketUpdates] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");

    const joinMarket = () => {
        const ws = new WebSocket(`ws://localhost:5173/chat?userName=${encodeURIComponent(userName)}`);
        ws.addEventListener("open", () => {
            setMessage("Connected to market!");
        });
        ws.addEventListener("message", event => {
            try {
                const data = JSON.parse(event.data);
                if(data.decision) {
                    setMarketUpdates(prev => [...prev, `Market Decision: ${data.decision}`]);
                } else if(data.priceUpdate) {
                    setMarketUpdates(prev => [...prev, `Price Update: ${data.priceUpdate}`]);
                } else {
                    console.log("Invalid messaeg here");
                }
            } catch (error) {
                console.log(error);
            }
        });
        ws.addEventListener("close", () => {
            setJoined(false);
            setSocket(null);
            setMessage("Disconnected from market updates");
        })
        setSocket(ws);
        setJoined(true);
    }
    const leaveMarket = () => {
        if(socket) socket.close();
    }
    return (
      <div>
        <Container p="md">
          {!joined ? (
            <Stack>
              <TextInput
                placeholder="Enter your name"
                label="Name"
                value={userName}
                onChange={(e) => setUserName(e.currentTarget.value)}
              />
              <Button onClick={joinMarket} disabled={!userName}>
                Join Market
              </Button>
            </Stack>
          ) : (
            <div>
              <Title order={2} mb="md">
                Live Market Simulator
              </Title>
              <Button onClick={leaveMarket} color="red" mb="md">
                Leave Market
              </Button>
              <Paper withBorder p="md" radius="md">
                {marketUpdates.length === 0 ? (
                  <Text>No updates yet...</Text>
                ) : (
                  marketUpdates.map((update, idx) => (
                    <Text key={idx}>{update}</Text>
                  ))
                )}
              </Paper>
            </div>
          )}
        </Container>
      </div>
    );
};

export default Market;
