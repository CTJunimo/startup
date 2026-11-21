# HTTP and Multiplayer Service

## Local Development

Use Node.js 20 or newer. Install the service dependencies once, then start the server and frontend from the startup folder in separate terminals:

```sh
npm install --prefix service
npm run server
npm run dev
```

Set `MONGO_URL` in the service process environment before running `npm run server`. `MONGODB_DB_NAME` is optional and defaults to `tictactoe`. Keep the connection URI out of source control.

The Express service listens on port `3000`; Vite proxies `/api` and `/ws` to it. It serves the React bundle, provides the account and match-history APIs, and accepts WebSocket connections at `/ws`. Open the app in two browser tabs, choose **Online** in both, and start both matches. Players are paired in arrival order. The server assigns X/O, validates turns, broadcasts moves, determines results, and notifies the remaining player if someone disconnects.

## Production Setup

`deployService.sh` builds the Vite frontend, copies it to `public`, and packages the service entry point, MongoDB adapter, and dependencies. On EC2, keep `MONGO_URL` and the optional `MONGODB_DB_NAME` in the owner-only file `/home/ubuntu/.config/startup/startup.env`; do not commit or copy this file with the application. Start the `startup` PM2 process with Node's `--env-file=/home/ubuntu/.config/startup/startup.env` option so the settings persist across deployments and restarts. The deployment script restarts the existing PM2 process. In production, the app is available at [https://startup.playtictactoe.click](https://startup.playtictactoe.click); Caddy proxies that hostname to port `4000`. The service listens on port `3000` by default (or `PORT` if configured) and serves the UI, HTTP APIs, and WebSocket upgrades.

When deploying from Windows through WSL, keep the SSH key in WSL's home directory and set its permissions to `600`; Windows-mounted key files may appear world-readable to WSL OpenSSH and be rejected.

Configure the HTTPS reverse proxy for the startup hostname to forward HTTP requests to the service, including `/api` and `/ws`; `/ws` must support WebSocket upgrades. The frontend automatically uses `wss://<current-host>/ws` on HTTPS.

Accounts, authentication tokens, and match history are stored in MongoDB and survive service restarts. Active multiplayer rooms are still held in service memory, so a restart ends games in progress.