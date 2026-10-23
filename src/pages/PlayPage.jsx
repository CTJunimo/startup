import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

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
  return { board: Array(9).fill(null), status: 'playing' };
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

function getStatusMessage(game) {
  if (game.status === 'X') return 'You win!';
  if (game.status === 'O') return 'Nova wins!';
  if (game.status === 'draw') return "It's a draw!";
  return 'In progress';
}

function MatchSidebar({ status, botName, difficulty }) {
  const dialogue = status === 'X'
    ? 'Well played! You got me this time.'
    : status === 'O'
      ? 'That one is mine! Want a rematch?'
      : status === 'draw'
        ? 'A tie! We are evenly matched.'
        : "Let's see what you've got!";

  return (
    <aside className="col-lg-5 match-sidebar">
      <section className="card dialogue-panel">
        <div className="card-body">
          <p className="eyebrow">{botName} says</p>
          <p className="bot-quote">“{dialogue}”</p>
          <div className="match-status">
            <span>Match status</span>
            <output id="result" className="status-pill" aria-live="polite">{getStatusMessage({ status })}</output>
          </div>
          <div className="match-status">
            <span>Difficulty</span>
            <output className="status-pill">{difficulty[0].toUpperCase() + difficulty.slice(1)}</output>
          </div>
        </div>
      </section>
      <section className="updates-panel" aria-labelledby="updates-heading">
        <div className="updates-heading">
          <h2 id="updates-heading">Live updates</h2>
          <span className="live-indicator">LIVE</span>
        </div>
        <ul id="live-updates" aria-live="polite">
          <li>Moves and match results will appear here.</li>
        </ul>
      </section>
    </aside>
  );
}

export default function PlayPage() {
  const [game, setGame] = useState(createNewGame);
  const [searchParams] = useSearchParams();
  const difficulty = ['easy', 'medium', 'hard'].includes(searchParams.get('difficulty'))
    ? searchParams.get('difficulty')
    : 'medium';
  const botName = { nova: 'Nova', milo: 'Milo', sage: 'Sage' }[searchParams.get('bot')] ?? 'Nova';

  function handleSelect(index) {
    setGame((currentGame) => {
      if (currentGame.status !== 'playing' || currentGame.board[index] !== null) return currentGame;

      const playerBoard = [...currentGame.board];
      playerBoard[index] = 'X';
      if (getWinner(playerBoard) === 'X') return { board: playerBoard, status: 'X' };
      if (playerBoard.every(Boolean)) return { board: playerBoard, status: 'draw' };

      const botBoard = [...playerBoard];
      const botMove = getBotMove(botBoard, difficulty);
      if (botMove === null) return { board: botBoard, status: 'draw' };
      botBoard[botMove] = 'O';

      if (getWinner(botBoard) === 'O') return { board: botBoard, status: 'O' };
      if (botBoard.every(Boolean)) return { board: botBoard, status: 'draw' };
      return { board: botBoard, status: 'playing' };
    });
  }

  return (
    <main className="container-xl page-shell">
      <div className="page-heading">
        <p className="eyebrow">Your match</p>
        <h1>{game.status === 'playing' ? 'Your move.' : getStatusMessage(game)}</h1>
      </div>
      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Game board">
          <div className="game-stage">
            <div className="match-strip">
              <div><span className="player-token token-x">X</span><span>You</span></div>
              <span className="versus">VS</span>
              <div><span className="player-token token-o">O</span><span>Nova</span></div>
            </div>
            <p className="game-prompt"><span className="turn-dot"></span><output id="turn" aria-live="polite">{game.status === 'playing' ? 'Your turn' : 'Match complete'}</output></p>
            <GameBoard game={game} onSelect={handleSelect} />
            <div className="board-actions">
              <button className="btn btn-outline-secondary" type="button" onClick={() => setGame(createNewGame())}>Restart match</button>
              <Link to="/bots">Change opponent</Link>
            </div>
          </div>
        </section>
        <MatchSidebar status={game.status} botName={botName} difficulty={difficulty} />
      </div>
    </main>
  );
}