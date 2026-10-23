import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../placeholder.png';
import { useAuth } from '../contexts/AuthContext.jsx';

function GameModeOptions({ canPlayOnline }) {
  return (
    <fieldset className="choice-group">
      <legend>Game mode</legend>
      <div className="mode-options">
        <div className="form-check mode-choice">
          <input className="form-check-input" id="bot-mode" name="mode" type="radio" value="bot" defaultChecked />
          <label className="form-check-label" htmlFor="bot-mode"><strong>Solo</strong><span>Play against a bot</span></label>
        </div>
        <div className="form-check mode-choice">
          <input className="form-check-input" id="multiplayer-mode" name="mode" type="radio" value="multiplayer" disabled={!canPlayOnline} />
          <label className="form-check-label" htmlFor="multiplayer-mode">
            <strong>Online</strong>
            <span>{canPlayOnline ? 'Challenge another player' : 'Sign in to challenge another player'}</span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

function BotSettings() {
  return (
    <fieldset className="choice-group bot-settings">
      <legend>Bot settings</legend>
      <div className="mb-3">
        <label className="form-label" htmlFor="bot">Personality</label>
        <select className="form-select" id="bot" name="bot" defaultValue="nova">
          <option value="nova">Nova - bold and competitive</option>
          <option value="milo">Milo - friendly and relaxed</option>
          <option value="sage">Sage - encouraging and apologetic</option>
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="difficulty">Difficulty</label>
        <select className="form-select" id="difficulty" name="difficulty" defaultValue="medium">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </fieldset>
  );
}

function PlayerCard({ user }) {
  return (
    <section className="col-lg-5" aria-labelledby="profile-heading">
      <div className="card profile-panel h-100">
        <div className="card-body">
          {user ? (
            <>
              <p className="eyebrow">Your player card</p>
              <h2 id="profile-heading">Ready to play, {user.displayName}?</h2>
              <figure className="profile-figure">
                <img src={profilePlaceholder} alt="Placeholder player profile image" />
                <figcaption>Your profile image is visible while signed in.</figcaption>
              </figure>
              <a className="api-link" href="https://api.api-ninjas.com/v1/randomimage" target="_blank" rel="noreferrer">
                Image source: Random Image API <span aria-hidden="true">↗</span>
              </a>
            </>
          ) : (
            <>
              <p className="eyebrow">Player profile</p>
              <h2 id="profile-heading">A profile image awaits</h2>
              <p className="lead-copy">Sign in to see your player image and unlock online matches.</p>
              <a className="btn btn-primary" href="#/">Sign in</a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function OpponentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleStartGame(event) {
    event.preventDefault();
    const settings = new URLSearchParams(new FormData(event.currentTarget));
    if (!user && settings.get('mode') === 'multiplayer') settings.set('mode', 'bot');
    navigate(`/play?${settings.toString()}`);
  }

  return (
    <main className="container-xl page-shell">
      <div className="page-heading">
        <p className="eyebrow">Set up a match</p>
        <h1>Choose your opponent</h1>
        <p className="lead-copy">Pick a mode, then find your kind of competition.</p>
      </div>
      <form className="row g-4 align-items-stretch" onSubmit={handleStartGame}>
        <section className="col-lg-7">
          <div className="card option-panel h-100">
            <div className="card-body">
              <GameModeOptions canPlayOnline={Boolean(user)} />
              <BotSettings />
              <button className="btn btn-primary start-button" type="submit">Start game <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </section>
        <PlayerCard user={user} />
      </form>
    </main>
  );
}