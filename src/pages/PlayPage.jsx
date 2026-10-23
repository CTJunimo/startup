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
      opening: "Finally, somone willing to test tehmselves against the best. Don't worry. I'll try not to end this too quickly.",
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

const mockOnlineOpponent = {
  name: 'Casey',
  reactions: {
    opening: 'I found a match! Good luck.',
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

function createNewGame() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    board: Array(9).fill(null),
    status: 'playing',
    reaction: 'opening',
  };
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

function GameBoard({ game, onSelect }) {
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
                    disabled={game.status !== 'playing'}
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
  if (game.status === 'waiting') return `Waiting for ${opponentName}...`;
  if (game.status === 'X') return 'You win!';
  if (game.status === 'O') return `${opponentName} wins!`;
  if (game.status === 'draw') return "It's a draw!";
  return 'In progress';
}

function MatchSidebar({ game, opponent, difficulty, mode }) {
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
            <output className="status-pill">{mode === 'multiplayer' ? 'Online demo' : difficulty[0].toUpperCase() + difficulty.slice(1)}</output>
          </div>
        </div>
      </section>
      <LiveUpdates />
    </aside>
  );
}

export default function PlayPage() {
  const [game, setGame] = useState(createNewGame);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { recordMatch } = useMatchHistory();
  const difficulty = ['easy', 'medium', 'hard'].includes(searchParams.get('difficulty'))
    ? searchParams.get('difficulty')
    : 'medium';
  const botProfile = botProfiles[searchParams.get('bot')] ?? botProfiles.nova;
  const mode = searchParams.get('mode') === 'multiplayer' ? 'multiplayer' : 'bot';
  const opponent = mode === 'multiplayer' ? mockOnlineOpponent : botProfile;
  const recordedGameId = useRef(null);

  useEffect(() => {
    if (!user || !['X', 'O', 'draw'].includes(game.status) || recordedGameId.current === game.id) return;
    recordedGameId.current = game.id;
    recordMatch({
      id: game.id,
      email: user.email,
      playedAt: new Date().toISOString(),
      opponent: opponent.name,
      mode,
      difficulty,
      result: game.status === 'X' ? 'Win' : game.status === 'O' ? 'Loss' : 'Draw',
    });
  }, [difficulty, game, mode, opponent.name, recordMatch, user]);

  useEffect(() => {
    if (mode !== 'multiplayer' || game.status !== 'waiting') return undefined;

    const timer = window.setTimeout(() => {
      setGame((currentGame) => {
        if (currentGame.status !== 'waiting') return currentGame;
        const nextBoard = [...currentGame.board];
        const move = getBotMove(nextBoard, 'medium');
        if (move === null) return { ...currentGame, status: 'draw', reaction: 'draw' };
        nextBoard[move] = 'O';
        if (getWinner(nextBoard) === 'O') return { ...currentGame, board: nextBoard, status: 'O', reaction: 'win' };
        if (nextBoard.every(Boolean)) return { ...currentGame, board: nextBoard, status: 'draw', reaction: 'draw' };
        return { ...currentGame, board: nextBoard, status: 'playing', reaction: 'move' };
      });
    }, 850);

    return () => window.clearTimeout(timer);
  }, [game.board, game.status, mode]);

  function handleSelect(index) {
    setGame((currentGame) => {
      if (currentGame.status !== 'playing' || currentGame.board[index] !== null) return currentGame;

      const playerBoard = [...currentGame.board];
      playerBoard[index] = 'X';
      if (getWinner(playerBoard) === 'X') return { ...currentGame, board: playerBoard, status: 'X', reaction: 'loss' };
      if (playerBoard.every(Boolean)) return { ...currentGame, board: playerBoard, status: 'draw', reaction: 'draw' };

      if (mode === 'multiplayer') {
        return { ...currentGame, board: playerBoard, status: 'waiting', reaction: 'move' };
      }

      const botBoard = [...playerBoard];
      const botMove = getBotMove(botBoard, difficulty);
      if (botMove === null) return { ...currentGame, board: botBoard, status: 'draw', reaction: 'draw' };
      botBoard[botMove] = 'O';

      if (getWinner(botBoard) === 'O') return { ...currentGame, board: botBoard, status: 'O', reaction: 'win' };
      if (botBoard.every(Boolean)) return { ...currentGame, board: botBoard, status: 'draw', reaction: 'draw' };
      return { ...currentGame, board: botBoard, status: 'playing', reaction: 'move' };
    });
  }

  return (
    <main className="container-xl page-shell">
      <div className="page-heading">
        <p className="eyebrow">Your match</p>
        <h1>{game.status === 'playing' ? 'Your move.' : getStatusMessage(game, opponent.name)}</h1>
      </div>
      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Game board">
          <div className="game-stage">
            <div className="match-strip">
              <div><span className="player-token token-x">X</span><span>{user.displayName}</span></div>
              <span className="versus">VS</span>
              <div><span className="player-token token-o">O</span><span>{opponent.name}</span></div>
            </div>
            <p className="game-prompt"><span className="turn-dot"></span><output id="turn" aria-live="polite">{game.status === 'waiting' ? `${opponent.name} is choosing a move...` : game.status === 'playing' ? 'Your turn' : 'Match complete'}</output></p>
            <GameBoard game={game} onSelect={handleSelect} />
            <div className="board-actions">
              <button className="btn btn-outline-secondary" type="button" onClick={() => setGame(createNewGame())}>Restart match</button>
              <Link to="/bots">Change opponent</Link>
            </div>
          </div>
        </section>
        <MatchSidebar game={game} opponent={opponent} difficulty={difficulty} mode={mode} />
      </div>
    </main>
  );
}