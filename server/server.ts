// Since we don't need dynamic keys or fancy things let's just use a typed object
const voteCounts: Record<string, number> = {
    buy: 0,
    sell: 0,
    hold: 0,
};  

type WebSocketData = {
    previousVoteTime: number;
    name: string;
}

const WAIT_TIME = 3.0;
const DECISION_PERIOD = 5.0;

// Note the second option is for custom routes
const server = Bun.serve<WebSocketData, {}>({
    port: 5453,
    fetch(req, server) {
        const url = new URL(req.url);
        const userName = url.searchParams.get("userName") || "Anonymous";
        server.upgrade(req, {
            data: {
                previousVoteTime: Date.now(),
                name: userName,
            }
        });
        return;
    },
    websocket: {
        idleTimeout: 100,
        maxPayloadLength: 1024 * 1024,
        open(ws) {
            console.log(`${ws.data.name} has connected`);
            ws.subscribe("stock-updates");
        },
        message(ws, message) {
            try {
                const { vote } = JSON.parse(String(message));
                if(!(vote in voteCounts)) {
                    console.log("Invalid Vote");
                    return;
                }
                if(Date.now() - ws.data.previousVoteTime > WAIT_TIME) {
                    voteCounts[vote as "buy" | "sell" | "hold"]++;
                    ws.data.previousVoteTime = Date.now();
                } else {
                    console.log("Please wait");
                }
            } catch (error) {
                console.log(error);
            }
        },
        close(ws, code, reason) {
            console.log("Websocket closed with code", reason);
        },
        drain(ws) {
            console.log("Websocket ready to recieve more data");
        },
    }, 
});

// Periodically check vote counts every DECISION_PERIOD
// We only buy or sell if it is the unique plurality option, otherwise hold
setInterval(() => {
    if (voteCounts.buy > voteCounts.sell && voteCounts.buy > voteCounts.hold) {
      server.publish("stock-updates", JSON.stringify({
        decision: "BUY",
      }));
    } else if (voteCounts.sell > voteCounts.buy && voteCounts.sell > voteCounts.hold) {
      server.publish("stock-updates", JSON.stringify({
        decision: "SELL",
      }));
    } else {
      server.publish("stock-updates", JSON.stringify({
        decision: "HOLD",
      }));
    }
    // Reset counts after publishing decision.
    voteCounts.buy = voteCounts.sell = voteCounts.hold = 0;
  }, DECISION_PERIOD);
