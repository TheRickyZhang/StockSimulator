// MarketProvider.tsx
import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface PricePoint {
  time: Date;
  price: number;
}
interface VoteCounts {
  buy: number;
  sell: number;
  hold: number;
}
interface MarketContextType {
  ws: WebSocket | null;
  price: number;
  updates: string[];
  running: boolean;
  priceHistory: PricePoint[];
  voteCounts: VoteCounts;
  cash: number;
  assets: number;
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
    const [updates, setUpdates] = useState<string[]>([]);
    const [running, setRunning] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState("");
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [voteCounts, setVoteCounts] = useState<VoteCounts>({
        buy: 0,
        sell: 0,
        hold: 0,
    });
    const [cash, setCash] = useState<number>(10000);
    const [assets, setAssets] = useState<number>(0);

  // Market simulation logic remains here...
  const startMarket = () => {
    if (intervalRef.current !== null) {
      console.log("ALREADY running");
      return;
    }
    setRunning(true);
    setUpdates([]);
    setPriceHistory([]);
    intervalRef.current = setInterval(() => {
      setPrice(prevPrice => {
        const delta = (Math.random() - 0.5) * 2;
        const newPrice = prevPrice + delta;
        setUpdates(prev => [...prev, `Price updated to: ${newPrice.toFixed(2)}`]);
        setPriceHistory(prevHistory => {
          const newPoint = { time: new Date(), price: newPrice };
          const newHistory = [...prevHistory, newPoint];
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          return newHistory;
        });
        return newPrice;
      });
    }, 1000);
  };

  const stopMarket = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setUpdates(prev => [...prev, `Market stopped at price: ${price.toFixed(2)}`]);
    // TODO: provide final price
  };

useEffect(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    
    const wsUrl = userName 
      ? `ws://localhost:8000?userName=${encodeURIComponent(userName)}`
      : `ws://localhost:8000`;
  
    const newWs = new WebSocket(wsUrl);
  
    newWs.onopen = () => {
      setMessage("Connected to market!");
      console.log("WebSocket open. ReadyState:", newWs.readyState);
    };
  
    newWs.onerror = (error) => {
      console.error("WebSocket encountered error:", error);
    };
  
    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("DATA", data);
        
        if (data.decision) {
            setUpdates(prev => [...prev, `Market Decision: ${data.decision}`]);
            if (data.decision === "BUY") {
                console.log("BUY!!!");
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
            } else {
                console.log("HELD!!!");
            }
            console.log("cash", cash);
        } else if (data.priceUpdate) {
          setUpdates(prev => [...prev, `Price Update: ${data.priceUpdate}`]);
        } else if (data.voteCounts) {
            console.log("Expected voteCOunts", data.voteCounts);
          setVoteCounts(data.voteCounts);
          setUpdates(prev => [...prev, `Updated Vote Counts: ${JSON.stringify(data.voteCounts)}`]);
        } else {
          console.log("Invalid message received");
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
      console.log("WebSocket message received");
    };
  
    newWs.onclose = () => {
      setMessage("Disconnected from market updates");
      console.log("WebSocket closed. ReadyState:", newWs.readyState);
    };
  
    setWs(newWs);
  
    return () => {
      newWs.close();
    };
  }, [userName]);
  
  // Updated sendVote with extra logging:
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
      price,
      priceHistory,
      updates,
      running,
      voteCounts,
      cash,
      assets,
      startMarket,
      stopMarket,
      sendVote,
    }}>
      {children}
    </MarketContext.Provider>
  );
};
