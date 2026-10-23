# Multiplayer Server

## Local Development

Use Node.js 20 or newer. Start these in separate terminals from the startup folder:

```sh
npm run server
npm run dev
```

The WebSocket service listens on port `3001`; Vite proxies `/ws` to it. Open the app in two browser tabs, choose **Online** in both, and start both matches. Players are paired in arrival order. The server assigns X/O, validates turns, broadcasts moves, determines results, and notifies the remaining player if someone disconnects.

## Production Setup

The current `deployReact.sh` publishes only the Vite frontend. Production multiplayer also requires deploying `server/index.js` and the root package files, installing production dependencies, and running `npm run server` persistently with `PORT=3001` under a process manager.

Configure the HTTPS reverse proxy for the startup hostname to forward `/ws` to `http://127.0.0.1:3001/ws` with WebSocket upgrade support. For Nginx, the location needs `proxy_http_version 1.1`, `Upgrade` and `Connection` headers, and an extended `proxy_read_timeout`. The frontend automatically uses `wss://<current-host>/ws` on HTTPS.

Rooms and match state are held in server memory. Restarting the server ends active matches; there is no database or reconnect/resume support yet.