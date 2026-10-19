import { Link } from 'react-router-dom';

const board = [
  [{ value: 'X', label: 'X' }, { value: '', label: 'empty' }, { value: '', label: 'empty' }],
  [{ value: '', label: 'empty' }, { value: 'O', label: 'O' }, { value: '', label: 'empty' }],
  [{ value: '', label: 'empty' }, { value: '', label: 'empty' }, { value: '', label: 'empty' }],
];

function GameSquare({ value, label, row, column }) {
  const markClass = value === 'X' ? ' mark-x' : value === 'O' ? ' mark-o' : '';
  return (
    <button className={`square${markClass}`} type="button" aria-label={`Row ${row}, column ${column}: ${label}`}>
      {value}
    </button>
  );
}

function GameBoard() {
  return (
    <table className="game-board">
      <caption className="visually-hidden">Tic-tac-toe game board</caption>
      <tbody>
        {board.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((square, columnIndex) => (
              <td key={`${rowIndex}-${columnIndex}`}>
                <GameSquare {...square} row={rowIndex + 1} column={columnIndex + 1} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatchSidebar() {
  return (
    <aside className="col-lg-5 match-sidebar">
      <section className="card dialogue-panel">
        <div className="card-body">
          <p className="eyebrow">Nova says</p>
          <p className="bot-quote">“Let's see what you've got!”</p>
          <div className="match-status">
            <span>Match status</span>
            <output id="result" className="status-pill">In progress</output>
          </div>
        </div>
      </section>
      <section className="updates-panel" aria-labelledby="updates-heading">
        <div className="updates-heading">
          <h2 id="updates-heading">Live updates</h2>
          <span className="live-indicator">LIVE</span>
        </div>
        <ul id="live-updates" aria-live="polite">
          <li>Multiplayer moves and player reactions will appear here.</li>
        </ul>
      </section>
    </aside>
  );
}

export default function PlayPage() {
  return (
    <main className="container-xl page-shell">
      <div className="page-heading">
        <p className="eyebrow">Your match</p>
        <h1>Nova is up next.</h1>
      </div>
      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Game board">
          <div className="game-stage">
            <div className="match-strip">
              <div><span className="player-token token-x">X</span><span>You</span></div>
              <span className="versus">VS</span>
              <div><span className="player-token token-o">O</span><span>Nova</span></div>
            </div>
            <p className="game-prompt"><span className="turn-dot"></span><output id="turn">Your turn</output></p>
            <GameBoard />
            <div className="board-actions">
              <button className="btn btn-outline-secondary" type="button">Restart match</button>
              <Link to="/bots">Change opponent</Link>
            </div>
          </div>
        </section>
        <MatchSidebar />
      </div>
    </main>
  );
}