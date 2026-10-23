import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useMatchHistory } from '../contexts/MatchHistoryContext.jsx';

function MatchRow({ match }) {
  const opponent = match.opponent || 'Opponent';
  const resultStyle = match.result === 'Win'
    ? 'result-win'
    : match.result === 'Loss'
      ? 'result-loss'
      : 'result-draw';

  return (
    <tr>
      <td>{new Date(match.playedAt).toLocaleDateString()}</td>
      <td><span className="opponent-mark mark-nova">{opponent[0]}</span>{opponent}</td>
      <td><span className="mode-tag">{match.mode === 'multiplayer' ? 'Online' : `Bot · ${match.difficulty}`}</span></td>
      <td><span className={`result-tag ${resultStyle}`}>{match.result}</span></td>
    </tr>
  );
}

function MatchTable({ matches }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle history-table">
        <caption className="visually-hidden">Your recent tic-tac-toe matches</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Opponent</th>
            <th scope="col">Mode</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => <MatchRow key={match.id} match={match} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { matches, clearHistory } = useMatchHistory();
  const player = user ?? { email: 'guest@local', displayName: 'Guest' };
  const userMatches = matches.filter((match) => match.email === player.email);

  return (
    <main className="container-xl page-shell">
      <div className="page-heading history-heading">
        <div>
          <p className="eyebrow">Your record</p>
          <h1>Recent matches</h1>
          <p className="lead-copy">Every game tells a story. Here's how the last few went.</p>
        </div>
        <Link className="btn btn-primary" to="/bots">Play a match <span aria-hidden="true">→</span></Link>
      </div>

      <section className="history-panel" aria-label="Recent match results">
        {userMatches.length > 0 ? (
          <MatchTable matches={userMatches} />
        ) : (
          <div className="history-empty">
            <h2>No matches yet</h2>
            <p>Your completed games will show up here.</p>
          </div>
        )}
        <div className="history-panel-footer">
          <p className="data-note">Saved in this browser</p>
          {userMatches.length > 0 && (
            <button className="text-action" type="button" onClick={() => clearHistory(player.email)}>Clear history</button>
          )}
        </div>
      </section>
    </main>
  );
}