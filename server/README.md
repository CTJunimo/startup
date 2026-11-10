# HTTP and Multiplayer Service

## Local Development

Use Node.js 20 or newer. Install the service dependencies once, then start the server and frontend from the startup folder in separate terminals:

```sh
npm install --prefix service
npm run server
npm run dev
```

The Express service listens on port `3000`; Vite proxies `/api` and `/ws` to it. It serves the React bundle, provides the account and match-history APIs, and accepts WebSocket connections at `/ws`. Open the app in two browser tabs, choose **Online** in both, and start both matches. Players are paired in arrival order. The server assigns X/O, validates turns, broadcasts moves, determines results, and notifies the remaining player if someone disconnects.

## Production Setup

`deployService.sh` builds the Vite frontend, copies it to `public`, and packages `service/index.js` with its service dependencies. The process manager starts the application on port `3000` (or `PORT` if configured). The same process serves the UI and HTTP APIs and handles WebSocket upgrades.

Configure the HTTPS reverse proxy for the startup hostname to forward HTTP requests to the service, including `/api` and `/ws`; `/ws` must support WebSocket upgrades. The frontend automatically uses `wss://<current-host>/ws` on HTTPS.

Accounts and match history are held in service memory. Restarting the service clears them and ends active matches; there is no database or reconnect/resume support yet.