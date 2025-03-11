// MarketProvider.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { VOTE_WAIT_TIME } from '@shared/constants';

interface VoteCounts {
  buy: number;
  sell: number;
  hold: number;
}

export interface PricePoint {
  time: string; // using ISO string format
  price: number;
}

interface MarketContextType {
  ws: WebSocket | null;
  wsReady: boolean;
  price: number;
  priceHistory: PricePoint[];
  updates: string[];
  running: boolean;
  voteCounts: VoteCounts;
  cash: number;
  assets: number;
  waitWarning: string | null;
  startMarket: () => void;
  stopMarket: () => void;
  sendVote: (action: "buy" | "sell" | "hold", userName?: string) => void;
}

export const MarketContext = createContext<MarketContextType | undefined>(undefined);

interface MarketProviderProps {
  userName: string | null;
  children: ReactNode;
}

export const MarketProvider: React.FC<MarketProviderProps> = ({ userName, children }) => {
  const [price, setPrice] = useState<number>(100);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [updates, setUpdates] = useState<string[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState<boolean>(false);
  const [waitWarning, setWaitWarning] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({ buy: 0, sell: 0, hold: 0 });
  const [cash, setCash] = useState<number>(10000);
  const [assets, setAssets] = useState<number>(0);

  const startMarket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "command", command: "start", initialPrice: 100 }));
    } else {
      console.error("Cannot send vote: either WebSocket is not open or user is not signed in", {
        wsReadyState: ws ? ws.readyState : 'null',
      });    
    }
  };
  const stopMarket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "command", command: "stop" }));
    } else {
      console.error("Cannot send vote: either WebSocket is not open or user is not signed in", {
        wsReadyState: ws ? ws.readyState : 'null',
      });        
    }
  };

  useEffect(() => {
    if (!userName) return;
    if (ws) {
      ws.close();
      setWs(null);
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    const fallbackUrl = protocol + host;
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || fallbackUrl;
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log("WebSocket open. ReadyState:", newWs.readyState);
      setWs(newWs);
      setWsReady(true);
      newWs.send(JSON.stringify({
        type: "init",
        data: { userAgent: navigator.userAgent }
      }));
    };

    newWs.onerror = (error) => {
      console.error("WebSocket encountered error:", error);
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("DATA", data);
        if (data.voteCounts) {
          setVoteCounts(data.voteCounts);
          setUpdates(prev => [...prev, `Updated Vote Counts: ${JSON.stringify(data.voteCounts)}`]);
        }
        if (data.price !== undefined) {
          setPrice(data.price);
        }
        if (data.priceHistory) {
          setPriceHistory(data.priceHistory);
        }
        if (typeof data.running === "boolean") {
          setRunning(data.running);
        }
        if (data.decision) {
          setUpdates(prev => [...prev, `Market Decision: ${data.decision}`]);
          if (data.decision === "BUY") {
            setCash(prevCash => {
              if (prevCash >= price) {
                setAssets(prevAssets => prevAssets + 1);
                return prevCash - price;
              }
              return prevCash;
            });
          } else if (data.decision === "SELL") {
            setAssets(prevAssets => {
              if (prevAssets > 0) {
                setCash(prevCash => prevCash + price);
                return prevAssets - 1;
              }
              return prevAssets;
            });
          }
        }
        if ('waitTimeLeft' in data) {
          const seconds = (data.waitTimeLeft / 1000).toFixed(1);
          setWaitWarning(`Please wait ${seconds} seconds before voting again.`);
          setTimeout(() => setWaitWarning(null), VOTE_WAIT_TIME);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newWs.onclose = () => {
      setWsReady(false);
      console.log("WebSocket closed. ReadyState:", newWs.readyState);
    };

    setWs(newWs);
    return () => {
      newWs.close();
    };
  }, [userName]);

  const sendVote = (action: "buy" | "sell" | "hold", voteUserName?: string) => {
    console.log(`Attempting to send vote. WebSocket readyState: ${ws ? ws.readyState : 'null'}`, { voteUserName });
    if (ws && ws.readyState === WebSocket.OPEN && voteUserName) {
      ws.send(JSON.stringify({ vote: action, userName: voteUserName }));
      console.log(`Vote sent: ${action} by ${voteUserName}`);
    } else {
      console.error("Cannot send vote: either WebSocket is not open or user is not signed in", {
        wsReadyState: ws ? ws.readyState : 'null',
        voteUserName
      });
    }
  };

  return (
    <MarketContext.Provider value={{
      ws,
      wsReady,
      price,
      priceHistory,
      updates,
      running,
      voteCounts,
      cash,
      assets,
      waitWarning,
      startMarket,
      stopMarket,
      sendVote,
    }}>
      {children}
    </MarketContext.Provider>
  );
};
