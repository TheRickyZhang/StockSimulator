import { serve } from "bun";

import {
  VOTE_WAIT_TIME,
  UPDATE_TIME,
  PRICE_UPDATE_TIME,
} from "@shared/constants";

let voteCounts = { buy: 0, sell: 0, hold: 0 };
let price = 100;
let priceHistory: PricePoint[] = [];
let running = false;
let simulationInterval: ReturnType<typeof setInterval> | null = null;

interface VoteCounts {
  buy: number;
  sell: number;
  hold: number;
}
interface PricePoint {
  time: Date;
  price: number;
}
interface dataInterface {
  previousVoteTime: Date;
  name: string;
}
interface VoteMessage {
  vote: "buy" | "sell" | "hold";
}
interface CommandMessage {
  type: "command";
  command: "start" | "stop";
  initialPrice?: number;
}

const PORT = Number(process.env.PORT) || 3000;

const server = serve({
  port: PORT,
  hostname: "0.0.0.0",
  fetch(req, server) {
    const url = new URL(req.url);
    const userName = url.searchParams.get("userName") || "Anonymous";
    if (
      server.upgrade(req, {
        data: { previousVoteTime: new Date(), name: userName },
      })
    ) {
      return;
    }
    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    publishToSelf: true,
    idleTimeout: 100,
    maxPayloadLength: 1024 * 1024,
    open(ws) {
      const data = ws.data as dataInterface;
      console.log(`${data.name} has connected`);
      ws.subscribe("stock-updates");
      // Immediately send the current market state + running
      server.publish(
        "stock-updates",
        JSON.stringify({
          voteCounts,
          price,
          priceHistory,
          running,
        })
      );
    },
    message(ws, message) {
      try {
        const parsed = JSON.parse(String(message));
        if (parsed.type === "command") {
          const { command, initialPrice } = parsed as CommandMessage;
          if (command === "start") {
            if (!running) {
              running = true;
              if (typeof initialPrice === "number") {
                price = initialPrice;
              }
              priceHistory = [];
              simulationInterval = setInterval(() => {
                const delta = (Math.random() - 0.5) * 2;
                price = Number((price + delta).toFixed(2));
                const newPoint: PricePoint = { time: new Date(), price };
                priceHistory.push(newPoint);
                if (priceHistory.length > 50) {
                  priceHistory.shift();
                }
                server.publish(
                  "stock-updates",
                  JSON.stringify({ price, priceHistory })
                );
                console.log(`Price updated: ${price}`);
              }, PRICE_UPDATE_TIME);
              server.publish("stock-updates", JSON.stringify({ running }));
            }
          } else if (command === "stop") {
            if (running) {
              running = false;
              if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
              }
              server.publish("stock-updates", JSON.stringify({ running }));
              console.log("Market stopped");
            }
          }
          return;
        }
        if (parsed.vote) {
          const data = ws.data as dataInterface;
          console.log("Vote message received:", parsed);
          const { vote } = parsed as VoteMessage;
          if (!(vote in voteCounts)) {
            console.log("Invalid vote", vote);
            return;
          }
          if (Date.now() - data.previousVoteTime.getTime() > VOTE_WAIT_TIME) {
            voteCounts[vote as "buy" | "sell" | "hold"]++;
            data.previousVoteTime = new Date();
            server.publish("stock-updates", JSON.stringify({ voteCounts }));
            console.log("Vote count updated:", voteCounts);
          } else {
            const remaining =
              VOTE_WAIT_TIME - (Date.now() - data.previousVoteTime.getTime());
            ws.send(JSON.stringify({ waitTimeLeft: remaining }));
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
    close(ws, code, reason) {
      const data = ws.data as dataInterface;
      console.log(`WebSocket for ${data.name} closed: ${reason}`);
    },
    drain(ws) {
      console.log("WebSocket ready to receive more data");
    },
  },
});

// Decision simulation: every UPDATE_TIME, publish a decision and reset voteCounts.
setInterval(() => {
  let decision: "BUY" | "SELL" | "HOLD";
  if (voteCounts.buy > voteCounts.sell && voteCounts.buy > voteCounts.hold) {
    decision = "BUY";
  } else if (
    voteCounts.sell > voteCounts.buy &&
    voteCounts.sell > voteCounts.hold
  ) {
    decision = "SELL";
  } else {
    decision = "HOLD";
  }
  server.publish("stock-updates", JSON.stringify({ decision }));
  console.log("Decision published:", decision);
  voteCounts = { buy: 0, sell: 0, hold: 0 };
  server.publish("stock-updates", JSON.stringify({ voteCounts }));
}, UPDATE_TIME);

console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
