import { Link } from 'react-router-dom';

const matches = [
  { date: 'October 18, 2026', opponent: 'Nova', initial: 'N', style: 'mark-nova', mode: 'Bot', result: 'Win', resultStyle: 'result-win' },
  { date: 'October 16, 2026', opponent: 'Jordan', initial: 'J', style: 'mark-jordan', mode: 'Multiplayer', result: 'Draw', resultStyle: 'result-draw' },
  { date: 'October 14, 2026', opponent: 'Milo', initial: 'M', style: 'mark-milo', mode: 'Bot', result: 'Loss', resultStyle: 'result-loss' },
];

function MatchRow({ match }) {
  return (
    <tr>
      <td>{match.date}</td>
      <td><span className={`opponent-mark ${match.style}`}>{match.initial}</span>{match.opponent}</td>
      <td><span className="mode-tag">{match.mode}</span></td>
      <td><span className={`result-tag ${match.resultStyle}`}>{match.result}</span></td>
    </tr>
  );
}

function MatchTable() {
  return (
    <section className="history-panel" aria-label="Recent match results">
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
            {matches.map((match) => <MatchRow key={`${match.date}-${match.opponent}`} match={match} />)}
          </tbody>
        </table>
      </div>
      <p className="data-note">Sample match history</p>
    </section>
  );
}

export default function HistoryPage() {
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
      <MatchTable />
    </main>
  );
}