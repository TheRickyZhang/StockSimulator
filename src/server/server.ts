import { serve, type ServerWebSocket } from "bun";

const VOTE_WAIT_TIME = 3000;
const UPDATE_TIME = 10000;
let voteCounts = { buy: 0, sell: 0, hold: 0 };

interface dataInterface {
    previousVoteTime: Date;
    name: string;
}
interface VoteMessage {
    vote: "buy" | "sell" | "hold";
  }
  
const server = serve({
  port: 8000,
  fetch(req, server) {
    // Extract userName from URL params; default to "Anonymous"
    const url = new URL(req.url);
    const userName = url.searchParams.get("userName") || "Anonymous";
    // Attempt to upgrade the request to a WebSocket connection,
    // passing contextual data (user name and current time)
    if (server.upgrade(req, { data: { previousVoteTime: new Date(), name: userName } })) {
      return;
    }
    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    publishToSelf: true, // NECESSARY
    idleTimeout: 100,
    maxPayloadLength: 1024 * 1024,
    open(ws) {
        const data = ws.data as dataInterface;
        console.log(`${data.name} has connected`);
        ws.subscribe("stock-updates");
        server.publish("stock-updates", JSON.stringify({ voteCounts, test: true }));
    },
    message(ws, message) {
      try {
        const data = ws.data as dataInterface;
        console.log("Message", JSON.parse(String(message)));
        const { vote } = JSON.parse(String(message)) as VoteMessage;
        if (!(vote in voteCounts)) {
          console.log("Invalid vote", vote);
          return;
        }
        if (Date.now() - data.previousVoteTime.getTime() > VOTE_WAIT_TIME) {
          voteCounts[vote as "buy" | "sell" | "hold"]++;
          data.previousVoteTime = new Date();
          server.publish("stock-updates", JSON.stringify({ voteCounts }));

          console.log(`Vote count updated:`, voteCounts);
        } else {
            const remaining = VOTE_WAIT_TIME - (Date.now() - data.previousVoteTime.getTime());
            ws.send(JSON.stringify({ waitTimeLeft: remaining }));
            console.log("Please wait before voting again");
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
    error(ws) {
        console.log("ERROR", error);
    }
  },
});

setInterval(() => {
    let decision: "BUY" | "SELL" | "HOLD";
    if (voteCounts.buy > voteCounts.sell && voteCounts.buy > voteCounts.hold) {
      decision = "BUY";
    } else if (voteCounts.sell > voteCounts.buy && voteCounts.sell > voteCounts.hold) {
      decision = "SELL";
    } else {
      decision = "HOLD";
    }
    server.publish("stock-updates", JSON.stringify({ decision }));
    console.log("Decision published:", decision);
    voteCounts = { buy: 0, sell: 0, hold: 0 };
  }, UPDATE_TIME);
  
console.log(`Listening on ws://localhost:${server.port}`);
