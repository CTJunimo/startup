const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { WebSocket, WebSocketServer } = require('ws');

const app = express();
const httpServer = http.createServer(app);
const webSocketServer = new WebSocketServer({ server: httpServer, path: '/ws', maxPayload: 1024 });
const authCookieName = 'token';
const frontendPath = fs.existsSync(path.resolve(__dirname, 'public'))
  ? path.resolve(__dirname, 'public')
  : path.resolve(__dirname, '../dist');
const users = new Map();
const matchesByEmail = new Map();
const rooms = new Map();
const activitySubscribers = new Set();
const recentActivity = [];
let waitingPlayer = null;
const port = Number(process.env.PORT ?? process.argv[2] ?? 3000);
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.post('/auth/create', async (req, res) => {
  const credentials = validateCredentials(req.body, true);
  const displayName = typeof req.body?.displayName === 'string'
    ? req.body.displayName.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 28)
    : '';
  if (!credentials || !displayName) {
    return res.status(400).send({ msg: 'A valid name, email, and password of at least 8 characters are required' });
  }
  if (users.has(credentials.email)) return res.status(409).send({ msg: 'An account already exists for that email' });

  const passwordHash = await bcrypt.hash(credentials.password, 10);
  if (users.has(credentials.email)) return res.status(409).send({ msg: 'An account already exists for that email' });
  const user = {
    email: credentials.email,
    displayName,
    passwordHash,
    token: randomUUID(),
  };
  users.set(user.email, user);
  setAuthCookie(res, user.token);
  res.status(201).send(publicUser(user));
});

apiRouter.post('/auth/login', async (req, res) => {
  const credentials = validateCredentials(req.body);
  if (!credentials) return res.status(400).send({ msg: 'A valid email and password are required' });

  const user = users.get(credentials.email);
  if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
    return res.status(401).send({ msg: 'Email or password is incorrect' });
  }
  user.token = randomUUID();
  setAuthCookie(res, user.token);
  res.send(publicUser(user));
});

apiRouter.delete('/auth/logout', (req, res) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (user) user.token = null;
  res.clearCookie(authCookieName, cookieOptions());
  res.status(204).end();
});

apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.send(publicUser(req.user));
});

apiRouter.get('/matches', verifyAuth, (req, res) => {
  res.send(matchesByEmail.get(req.user.email) ?? []);
});

apiRouter.post('/matches', verifyAuth, (req, res) => {
  const match = validateMatch(req.body);
  if (!match) return res.status(400).send({ msg: 'Invalid match details' });

  const matches = matchesByEmail.get(req.user.email) ?? [];
  if (!matches.some((existing) => existing.id === match.id)) {
    matchesByEmail.set(req.user.email, [match, ...matches].slice(0, 50));
  }
  res.status(201).send(matchesByEmail.get(req.user.email));
});

apiRouter.delete('/matches', verifyAuth, (req, res) => {
  matchesByEmail.delete(req.user.email);
  res.status(204).end();
});

apiRouter.get('/protected', verifyAuth, (req, res) => {
  res.send({ message: `Hello, ${req.user.displayName}` });
});

app.get('/health', (_req, res) => res.send({ status: 'ok' }));
app.use('/api', (_req, res) => res.status(404).send({ msg: 'API endpoint not found' }));
app.use(express.static(frontendPath));
app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) return next();
  res.sendFile('index.html', { root: frontendPath }, (err) => {
    if (err) next(err);
  });
});
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = [400, 413].includes(err.status) ? err.status : 500;
  const msg = status === 413 ? 'Request body is too large' : status === 400 ? 'Invalid request body' : 'Internal server error';
  res.status(status).send({ msg });
});

webSocketServer.on('connection', (socket, request) => {
  const token = parseCookie(request.headers.cookie, authCookieName);
  const signedInUser = findUserByToken(token);
  const player = { socket, name: signedInUser?.displayName ?? 'Player', mark: null, room: null, signedIn: Boolean(signedInUser) };

  socket.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      send(socket, { type: 'error', message: 'Invalid message.' });
      return;
    }

    if (message.type === 'subscribe' && player.signedIn) {
      activitySubscribers.add(socket);
      send(socket, { type: 'live-snapshot', updates: recentActivity });
    } else if (message.type === 'publish-match' && player.signedIn) {
      const results = { Win: 'won', Loss: 'lost', Draw: 'drew' };
      if (Object.hasOwn(results, message.result)) {
        const opponent = cleanName(message.opponent);
        const mode = message.mode === 'multiplayer' ? 'online' : 'bot';
        broadcastLiveUpdate(`${player.name} ${results[message.result]} a ${mode} match against ${opponent}.`);
      }
    } else if (message.type === 'join' && !player.room && waitingPlayer !== player) {
      startMatchmaking(player, message.name);
    } else if (message.type === 'move') {
      processMove(player, message.index);
    } else if (message.type === 'restart') {
      restartMatch(player);
    }
  });

  socket.on('close', () => {
    activitySubscribers.delete(socket);
    disconnectPlayer(player);
  });
  socket.on('error', () => {
    activitySubscribers.delete(socket);
    disconnectPlayer(player);
  });
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Tic-tac-toe service listening on port ${port}`);
});

function verifyAuth(req, res, next) {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (!user) return res.status(401).send({ msg: 'Unauthorized' });
  req.user = user;
  next();
}

function validateCredentials(body, validatePasswordLength = false) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const validEmail = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordBytes = Buffer.byteLength(password, 'utf8');
  const validPassword = passwordBytes > 0 && passwordBytes <= 72
    && (!validatePasswordLength || password.length >= 8);
  return validEmail && validPassword ? { email, password } : null;
}

function validateMatch(body) {
  if (!body || typeof body !== 'object') return null;
  const validId = typeof body.id === 'string' && body.id.length > 0 && body.id.length <= 100;
  const validOpponent = typeof body.opponent === 'string' && body.opponent.trim().length > 0 && body.opponent.length <= 28;
  const validMode = body.mode === 'bot' || body.mode === 'multiplayer';
  const validDifficulty = ['easy', 'medium', 'hard'].includes(body.difficulty);
  const validResult = ['Win', 'Loss', 'Draw'].includes(body.result);
  const playedAt = typeof body.playedAt === 'string' && Number.isFinite(Date.parse(body.playedAt));
  if (!validId || !validOpponent || !validMode || !validDifficulty || !validResult || !playedAt) return null;
  return {
    id: body.id,
    opponent: body.opponent.trim(),
    mode: body.mode,
    difficulty: body.difficulty,
    result: body.result,
    playedAt: new Date(body.playedAt).toISOString(),
  };
}

function publicUser(user) {
  return { email: user.email, displayName: user.displayName };
}

function findUserByToken(token) {
  if (!token) return null;
  for (const user of users.values()) {
    if (user.token === token) return user;
  }
  return null;
}

function cookieOptions() {
  return {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    ...cookieOptions(),
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
}

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const cookie of cookieHeader.split(';')) {
    const [key, ...value] = cookie.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function cleanName(value) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28) || 'Player'
    : 'Player';
}

function addActivity(room, text) {
  room.activity = [...room.activity, { id: randomUUID(), text }].slice(-8);
}

function broadcastLiveUpdate(text) {
  const update = { id: randomUUID(), text, createdAt: new Date().toISOString() };
  recentActivity.unshift(update);
  recentActivity.splice(8);
  for (const socket of activitySubscribers) send(socket, { type: 'live-update', update });
}

function findWinner(board) {
  for (const [first, second, third] of winningLines) {
    if (board[first] && board[first] === board[second] && board[first] === board[third]) return board[first];
  }
  return null;
}

function sendState(room) {
  for (const player of room.players) {
    const opponent = room.players.find((other) => other !== player);
    const result = room.status !== 'finished'
      ? null
      : room.winner === 'draw'
        ? 'draw'
        : room.winner === player.mark ? 'win' : 'loss';
    send(player.socket, {
      type: 'state',
      roomId: room.id,
      gameId: room.gameId,
      board: room.board,
      status: room.status,
      turnMark: room.turnMark,
      playerMark: player.mark,
      playerName: player.name,
      opponentName: opponent?.name ?? 'Waiting for opponent',
      result,
      activity: room.activity,
    });
  }
}

function createRoom(firstPlayer, secondPlayer) {
  const room = {
    id: randomUUID(),
    gameId: randomUUID(),
    board: Array(9).fill(null),
    status: 'playing',
    turnMark: 'X',
    winner: null,
    activity: [],
    players: [firstPlayer, secondPlayer],
  };
  firstPlayer.mark = 'X';
  secondPlayer.mark = 'O';
  firstPlayer.room = room;
  secondPlayer.room = room;
  if (firstPlayer.name === secondPlayer.name) {
    firstPlayer.name = `${firstPlayer.name} 1`;
    secondPlayer.name = `${secondPlayer.name} 2`;
  }
  rooms.set(room.id, room);
  addActivity(room, 'Match started. X moves first.');
  sendState(room);
}

function startMatchmaking(player, requestedName) {
  if (!player.signedIn) player.name = cleanName(requestedName ?? player.name);
  if (waitingPlayer && waitingPlayer.socket.readyState === WebSocket.OPEN) {
    const firstPlayer = waitingPlayer;
    waitingPlayer = null;
    createRoom(firstPlayer, player);
    return;
  }
  waitingPlayer = player;
  send(player.socket, {
    type: 'state',
    roomId: null,
    board: Array(9).fill(null),
    status: 'waiting',
    turnMark: 'X',
    playerMark: 'X',
    playerName: player.name,
    opponentName: 'Waiting for opponent',
    result: null,
    activity: [],
  });
}

function processMove(player, index) {
  const room = player.room;
  if (!room || room.status !== 'playing') return;
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    send(player.socket, { type: 'error', message: 'Choose a valid board square.' });
    return;
  }
  if (player.mark !== room.turnMark || room.board[index] !== null) {
    send(player.socket, { type: 'error', message: 'That square is unavailable or it is not your turn.' });
    return;
  }
  room.board[index] = player.mark;
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  addActivity(room, `${player.name} placed ${player.mark} in row ${row}, column ${column}.`);
  const winner = findWinner(room.board);
  if (winner) {
    room.status = 'finished';
    room.winner = winner;
    addActivity(room, `${room.players.find((participant) => participant.mark === winner).name} won the match.`);
  } else if (room.board.every(Boolean)) {
    room.status = 'finished';
    room.winner = 'draw';
    addActivity(room, 'The match ended in a draw.');
  } else {
    room.turnMark = player.mark === 'X' ? 'O' : 'X';
  }
  if (room.status === 'finished' && room.players.some((participant) => participant.signedIn)) {
    const text = room.winner === 'draw'
      ? `${room.players.map((participant) => participant.name).join(' and ')} drew an online match.`
      : `${room.players.find((participant) => participant.mark === room.winner).name} won an online match.`;
    broadcastLiveUpdate(text);
  }
  sendState(room);
}

function restartMatch(player) {
  const room = player.room;
  if (!room) {
    startMatchmaking(player);
    return;
  }
  room.gameId = randomUUID();
  room.board = Array(9).fill(null);
  room.status = 'playing';
  room.turnMark = 'X';
  room.winner = null;
  room.activity = [];
  addActivity(room, `${player.name} restarted the match. X moves first.`);
  sendState(room);
}

function disconnectPlayer(player) {
  if (waitingPlayer === player) waitingPlayer = null;
  const room = player.room;
  if (!room) return;
  rooms.delete(room.id);
  for (const otherPlayer of room.players) {
    otherPlayer.room = null;
    if (otherPlayer !== player && room.status !== 'finished') {
      send(otherPlayer.socket, { type: 'opponent-left', message: `${player.name} disconnected.` });
    }
  }
}
