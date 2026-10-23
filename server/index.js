import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';

const port = Number(process.env.PORT ?? 3001);
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const rooms = new Map();
let waitingPlayer = null;

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function addActivity(room, text) {
  room.activity = [...room.activity, { id: randomUUID(), text }].slice(-8);
}

function findWinner(board) {
  for (const [first, second, third] of winningLines) {
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return board[first];
    }
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
        : room.winner === player.mark
          ? 'win'
          : 'loss';

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

function startMatchmaking(player) {
  player.name = typeof player.name === 'string'
    ? player.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 28) || 'Player'
    : 'Player';

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
    const winningPlayer = room.players.find((participant) => participant.mark === winner);
    addActivity(room, `${winningPlayer.name} won the match.`);
  } else if (room.board.every(Boolean)) {
    room.status = 'finished';
    room.winner = 'draw';
    addActivity(room, 'The match ended in a draw.');
  } else {
    room.turnMark = player.mark === 'X' ? 'O' : 'X';
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

const httpServer = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', rooms: rooms.size, waiting: Boolean(waitingPlayer) }));
    return;
  }
  response.writeHead(404);
  response.end('Not found');
});

const webSocketServer = new WebSocketServer({ server: httpServer, path: '/ws', maxPayload: 1024 });

webSocketServer.on('connection', (socket) => {
  const player = { socket, name: 'Player', mark: null, room: null };

  socket.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      send(socket, { type: 'error', message: 'Invalid message.' });
      return;
    }

    if (message.type === 'join' && !player.room && waitingPlayer !== player) {
      player.name = message.name;
      startMatchmaking(player);
    } else if (message.type === 'move') {
      processMove(player, message.index);
    } else if (message.type === 'restart') {
      restartMatch(player);
    }
  });

  socket.on('close', () => disconnectPlayer(player));
  socket.on('error', () => disconnectPlayer(player));
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Tic-tac-toe WebSocket server listening on port ${port}`);
});