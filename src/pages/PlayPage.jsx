import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LiveUpdates from '../components/LiveUpdates.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useMatchHistory } from '../contexts/MatchHistoryContext.jsx';

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const botProfiles = {

  nova: {
    name: 'Nova',
    reactions: {
      opening: "Finally, somone willing to test themselves against the best. Don't worry. I'll try not to end this too quickly.",
      move: "Well, now. That's a bold move. Not sure if you're brilliant or reckless.",
      win: "That's game. If this was the best you had, you probably shouldn't have challenged me.",
      loss: "...Hah. Well played. A worthy opponent at last!",
      draw: "A draw? Interesting. Looks like I'll have to take you seriously.",
    },
  },
  milo: {
    name: 'Milo',
    reactions: {
      opening: 'Hi! Glad we get to play! Ready to go?',
      move: 'Nice move! This is a fun one.',
      win: 'I won? Nice! Good game!',
      loss: 'Haha, I walked right into that one.',
      draw: 'Hey, not bad! We tied.',
    },
  },
  sage: {
    name: 'Sage',
    reactions: {
      opening: "Oh, hi! I hope you're having a nice day.",
      move: "Oh! That's a good move. Great choice!",
      win: "Oh! I won? I'm sorry, I didn't mean to make things difficult!",
      loss: "Wow! You played so well! Do you want to play again?",
      draw: "Oh, a draw! You played really well!",
    },
  },
};

const onlineOpponent = {
  reactions: {
    opening: 'Waiting for another player to join.',
    move: 'Nice move. Let me think about this.',
    win: 'That was a close one. Nice game!',
    loss: 'You got me. Want another round?',
    draw: 'A draw! That was close.',
  },
};

function getWinner(board) {
  for (const [first, second, third] of winningLines) {
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return board[first];
    }
  }
  return null;
}

function findWinningMove(board, mark) {
  for (const line of winningLines) {
    const values = line.map((index) => board[index]);
    if (values.filter((value) => value === mark).length === 2 && values.filter((value) => value === null).length === 1) {
      return line[values.indexOf(null)];
    }
  }
  return null;
}

function getAvailableMoves(board) {
  return board.flatMap((value, index) => value === null ? [index] : []);
}

function chooseRandom(moves) {
  return moves[Math.floor(Math.random() * moves.length)] ?? null;
}

function getEasyMove(board) {
  return chooseRandom(getAvailableMoves(board));
}

function getMediumMove(board) {
  const winningMove = findWinningMove(board, 'O');
  if (winningMove !== null) return winningMove;

  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove !== null) return blockingMove;

  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  return chooseRandom(corners.length > 0 ? corners : getAvailableMoves(board));
}

function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
  const winner = getWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(Boolean)) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;
  for (const move of getAvailableMoves(board)) {
    board[move] = isMaximizing ? 'O' : 'X';
    const score = minimax(board, depth + 1, !isMaximizing, alpha, beta);
    board[move] = null;

    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break;
  }
  return bestScore;
}

function getHardMove(board) {
  const searchBoard = [...board];
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const move of getAvailableMoves(searchBoard)) {
    searchBoard[move] = 'O';
    const score = minimax(searchBoard, 0, false);
    searchBoard[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  return chooseRandom(bestMoves);
}

function getBotMove(board, difficulty) {
  if (difficulty === 'easy') return getEasyMove(board);
  if (difficulty === 'hard') return getHardMove(board);
  return getMediumMove(board);
}

function createNewGame(status = 'playing') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    board: Array(9).fill(null),
    status,
    reaction: 'opening',
    activity: [],
    playerMark: null,
    turnMark: null,
    opponentName: null,
  };
}

function withActivity(game, ...messages) {
  const events = messages.map((text, index) => ({
    id: `${game.id}-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    text,
  }));
  return { ...game, activity: [...game.activity, ...events].slice(-6) };
}

function moveDescription(name, mark, index) {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return `${name} placed ${mark} in row ${row}, column ${column}.`;
}

function GameSquare({ value, index, onSelect, disabled }) {
  const markClass = value === 'X' ? ' mark-x' : value === 'O' ? ' mark-o' : '';
  return (
    <button
      className={`square${markClass}`}
      type="button"
      aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${value ?? 'empty'}`}
      onClick={() => onSelect(index)}
      disabled={disabled || value !== null}
    >
      {value}
    </button>
  );
}

function GameBoard({ game, onSelect, disabled = false }) {
  return (
    <table className="game-board">
      <caption className="visually-hidden">Tic-tac-toe game board</caption>
      <tbody>
        {[0, 1, 2].map((row) => (
          <tr key={row}>
            {[0, 1, 2].map((column) => {
              const index = row * 3 + column;
              return (
                <td key={index}>
                  <GameSquare
                    value={game.board[index]}
                    index={index}
                    onSelect={onSelect}
                    disabled={disabled || game.status !== 'playing'}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function getStatusMessage(game, opponentName) {
  if (game.status === 'connecting') return 'Connecting to multiplayer...';
  if (game.status === 'waiting' && opponentName === 'Waiting for opponent') return 'Waiting for another player...';
  if (game.status === 'waiting') return `Waiting for ${opponentName}...`;
  if (game.status === 'opponent-left') return 'Opponent disconnected.';
  if (game.status === 'X') return 'You win!';
  if (game.status === 'O') return `${opponentName} wins!`;
  if (game.status === 'draw') return "It's a draw!";
  return 'In progress';
}

function MatchSidebar({ game, opponent, difficulty, mode, connectionStatus, sharedActivity, userSignedIn, feedConnected }) {
  return (
    <aside className="col-lg-5 match-sidebar">
      <section className="card dialogue-panel">
        <div className="card-body">
          <p className="eyebrow">{opponent.name} says</p>
          <p className="bot-quote">“{opponent.reactions[game.reaction]}”</p>
          <div className="match-status">
            <span>Match status</span>
            <output id="result" className="status-pill" aria-live="polite">{getStatusMessage(game, opponent.name)}</output>
          </div>
          <div className="match-status">
            <span>{mode === 'multiplayer' ? 'Opponent' : 'Difficulty'}</span>
            <output className="status-pill">{mode === 'multiplayer' ? 'Online match' : difficulty[0].toUpperCase() + difficulty.slice(1)}</output>
          </div>
          {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
            <p className="form-error" role="alert">Connection lost. Restart the match to reconnect.</p>
          )}
        </div>
      </section>
      <LiveUpdates
        activity={game.activity}
        sharedActivity={sharedActivity}
        label={mode === 'multiplayer'
          ? connectionStatus === 'connected'
            ? 'ONLINE'
            : connectionStatus === 'error' || connectionStatus === 'disconnected' ? 'OFFLINE' : 'CONNECTING'
          : userSignedIn ? feedConnected ? 'LIVE' : 'CONNECTING' : 'LOCAL'}
      />
    </aside>
  );
}

export default function PlayPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'multiplayer' ? 'multiplayer' : 'bot';
  const [game, setGame] = useState(() => createNewGame(mode === 'multiplayer' ? 'connecting' : 'playing'));
  const { user } = useAuth();
  const { recordMatch } = useMatchHistory();
  const player = user ?? { email: 'guest@local', displayName: 'Guest' };
  const [connectionStatus, setConnectionStatus] = useState(mode === 'multiplayer' ? 'connecting' : 'local');
  const socketRef = useRef(null);
  const [sharedActivity, setSharedActivity] = useState([]);
  const [feedConnected, setFeedConnected] = useState(false);
  const feedSocketRef = useRef(null);
  const difficulty = ['easy', 'medium', 'hard'].includes(searchParams.get('difficulty'))
    ? searchParams.get('difficulty')
    : 'medium';
  const botProfile = botProfiles[searchParams.get('bot')] ?? botProfiles.nova;
  const opponent = mode === 'multiplayer'
    ? { ...onlineOpponent, name: game.opponentName ?? 'another player' }
    : botProfile;
  const recordedGameId = useRef(null);
  const publishedMatchIds = useRef(new Set());

  useEffect(() => {
    if (!user) {
      setSharedActivity([]);
      setFeedConnected(false);
      return undefined;
    }

    let active = true;
    const socketUrl = new URL('/ws', window.location.href);
    socketUrl.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(socketUrl);
    feedSocketRef.current = socket;

    socket.addEventListener('open', () => {
      if (!active) return;
      setFeedConnected(true);
      socket.send(JSON.stringify({ type: 'subscribe', signedIn: true, name: player.displayName }));
    });
    socket.addEventListener('message', (event) => {
      if (!active) return;
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === 'live-snapshot') setSharedActivity(message.updates ?? []);
      if (message.type === 'live-update') {
        setSharedActivity((current) => [message.update, ...current].slice(0, 8));
      }
    });
    socket.addEventListener('close', () => {
      if (active) setFeedConnected(false);
    });
    socket.addEventListener('error', () => {
      if (active) setFeedConnected(false);
    });

    return () => {
      active = false;
      if (feedSocketRef.current === socket) feedSocketRef.current = null;
      socket.close();
      setFeedConnected(false);
    };
  }, [player.displayName, user]);

  useEffect(() => {
    if (mode !== 'multiplayer') {
      setConnectionStatus('local');
      return undefined;
    }

    let active = true;
    const socketUrl = new URL('/ws', window.location.href);
    socketUrl.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;
    setConnectionStatus('connecting');

    socket.addEventListener('open', () => {
      if (!active) return;
      setConnectionStatus('connected');
      socket.send(JSON.stringify({ type: 'join', name: player.displayName, signedIn: Boolean(user) }));
    });

    socket.addEventListener('message', (event) => {
      if (!active) return;
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.type === 'state') {
        const status = message.status === 'finished'
          ? message.result === 'draw' ? 'draw' : message.result === 'win' ? 'X' : 'O'
          : message.status;
        const reaction = status === 'X'
          ? 'loss'
          : status === 'O'
            ? 'win'
            : status === 'draw'
              ? 'draw'
              : message.status === 'waiting' ? 'opening' : 'move';

        setGame((currentGame) => ({
          ...currentGame,
          id: message.gameId ?? currentGame.id,
          board: message.board,
          status,
          reaction,
          playerMark: message.playerMark,
          turnMark: message.turnMark,
          opponentName: message.opponentName,
          activity: message.activity,
        }));
      } else if (message.type === 'opponent-left') {
        setGame((currentGame) => withActivity({ ...currentGame, status: 'opponent-left' }, message.message));
      } else if (message.type === 'error') {
        setGame((currentGame) => withActivity(currentGame, message.message));
      }
    });

    socket.addEventListener('error', () => {
      if (active) setConnectionStatus('error');
    });
    socket.addEventListener('close', () => {
      if (active) setConnectionStatus((currentStatus) => currentStatus === 'error' ? 'error' : 'disconnected');
    });

    return () => {
      active = false;
      if (socketRef.current === socket) socketRef.current = null;
      socket.close();
    };
  }, [mode, player.displayName, user]);

  useEffect(() => {
    if (!user || !['X', 'O', 'draw'].includes(game.status) || recordedGameId.current === game.id) return;
    recordedGameId.current = game.id;
    recordMatch({
      id: game.id,
      email: player.email,
      playedAt: new Date().toISOString(),
      opponent: opponent.name,
      mode,
      difficulty,
      result: game.status === 'X' ? 'Win' : game.status === 'O' ? 'Loss' : 'Draw',
    });
  }, [difficulty, game, mode, opponent.name, player.email, recordMatch]);

  useEffect(() => {
    if (!user || mode === 'multiplayer' || !feedConnected || !['X', 'O', 'draw'].includes(game.status)) return;
    if (publishedMatchIds.current.has(game.id)) return;

    const socket = feedSocketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return;
    publishedMatchIds.current.add(game.id);
    socket.send(JSON.stringify({
      type: 'publish-match',
      signedIn: true,
      name: player.displayName,
      opponent: opponent.name,
      mode,
      result: game.status === 'X' ? 'Win' : game.status === 'O' ? 'Loss' : 'Draw',
    }));
  }, [feedConnected, game, mode, opponent.name, player.displayName, user]);

  function handleSelect(index) {
    if (mode === 'multiplayer') {
      const socket = socketRef.current;
      if (game.status === 'playing' && game.turnMark === game.playerMark && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', index }));
      }
      return;
    }

    setGame((currentGame) => {
      if (currentGame.status !== 'playing' || currentGame.board[index] !== null) return currentGame;

      const playerBoard = [...currentGame.board];
      playerBoard[index] = 'X';
      const playerMove = moveDescription(player.displayName, 'X', index);
      const afterPlayerMove = { ...currentGame, board: playerBoard };
      if (getWinner(playerBoard) === 'X') return withActivity({ ...afterPlayerMove, status: 'X', reaction: 'loss' }, playerMove, `${player.displayName} won the match.`);
      if (playerBoard.every(Boolean)) return withActivity({ ...afterPlayerMove, status: 'draw', reaction: 'draw' }, playerMove, "The match ended in a draw.");

      const botBoard = [...playerBoard];
      const botMove = getBotMove(botBoard, difficulty);
      if (botMove === null) return withActivity({ ...afterPlayerMove, status: 'draw', reaction: 'draw' }, playerMove, "The match ended in a draw.");
      botBoard[botMove] = 'O';
      const afterBotMove = { ...afterPlayerMove, board: botBoard };
      const botMoveEvent = moveDescription(opponent.name, 'O', botMove);

      if (getWinner(botBoard) === 'O') return withActivity({ ...afterBotMove, status: 'O', reaction: 'win' }, playerMove, botMoveEvent, `${opponent.name} won the match.`);
      if (botBoard.every(Boolean)) return withActivity({ ...afterBotMove, status: 'draw', reaction: 'draw' }, playerMove, botMoveEvent, "The match ended in a draw.");
      return withActivity({ ...afterBotMove, status: 'playing', reaction: 'move' }, playerMove, botMoveEvent);
    });
  }

  function handleRestart() {
    if (mode === 'multiplayer') {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'restart', name: player.displayName }));
      } else {
        window.location.reload();
      }
      return;
    }
    setGame(createNewGame());
  }

  const playerMark = mode === 'multiplayer' ? game.playerMark ?? 'X' : 'X';
  const opponentMark = playerMark === 'X' ? 'O' : 'X';
  const playerName = mode === 'multiplayer' ? game.playerName ?? player.displayName : player.displayName;

  return (
    <main className="container-xl page-shell">
      <div className="page-heading">
        <p className="eyebrow">Your match</p>
        <h1>{game.status === 'playing'
          ? mode === 'multiplayer' && game.turnMark !== game.playerMark ? `${opponent.name}'s move.` : 'Your move.'
          : getStatusMessage(game, opponent.name)}</h1>
      </div>
      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Game board">
          <div className="game-stage">
            <div className="match-strip">
              <div><span className={`player-token ${playerMark === 'X' ? 'token-x' : 'token-o'}`}>{playerMark}</span><span>{playerName}</span></div>
              <span className="versus">VS</span>
              <div><span className={`player-token ${opponentMark === 'X' ? 'token-x' : 'token-o'}`}>{opponentMark}</span><span>{opponent.name}</span></div>
            </div>
            <p className="game-prompt"><span className="turn-dot"></span><output id="turn" aria-live="polite">{game.status === 'playing'
              ? mode === 'multiplayer' && game.turnMark !== game.playerMark ? `${opponent.name}'s turn` : 'Your turn'
              : getStatusMessage(game, opponent.name)}</output></p>
            <GameBoard
              game={game}
              onSelect={handleSelect}
              disabled={mode === 'multiplayer' && (connectionStatus !== 'connected' || game.turnMark !== game.playerMark)}
            />
            <div className="board-actions">
              <button className="btn btn-outline-secondary" type="button" onClick={handleRestart}>Restart match</button>
              <Link to="/bots">Change opponent</Link>
            </div>
          </div>
        </section>
        <MatchSidebar
          game={game}
          opponent={opponent}
          difficulty={difficulty}
          mode={mode}
          connectionStatus={connectionStatus}
          sharedActivity={sharedActivity}
          userSignedIn={Boolean(user)}
          feedConnected={feedConnected}
        />
      </div>
    </main>
  );
}