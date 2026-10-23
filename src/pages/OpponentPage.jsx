import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../placeholder.png';

function GameModeOptions() {
  return (
    <fieldset className="choice-group">
      <legend>Game mode</legend>
      <div className="mode-options">
        <div className="form-check mode-choice">
          <input className="form-check-input" id="bot-mode" name="mode" type="radio" value="bot" defaultChecked />
          <label className="form-check-label" htmlFor="bot-mode"><strong>Solo</strong><span>Play against a bot</span></label>
        </div>
        <div className="form-check mode-choice">
          <input className="form-check-input" id="multiplayer-mode" name="mode" type="radio" value="multiplayer" />
          <label className="form-check-label" htmlFor="multiplayer-mode"><strong>Online</strong><span>Challenge another player</span></label>
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
          <option value="sage">Sage - nervous and eager to please</option>
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

function PlayerCard() {
  return (
    <section className="col-lg-5" aria-labelledby="profile-heading">
      <div className="card profile-panel h-100">
        <div className="card-body">
          <p className="eyebrow">Your player card</p>
          <h2 id="profile-heading">Ready to play?</h2>
          <figure className="profile-figure">
            <img src={profilePlaceholder} alt="Placeholder player profile image" />
            <figcaption>A random image will represent your player profile.</figcaption>
          </figure>
          <a className="api-link" href="https://api.api-ninjas.com/v1/randomimage" target="_blank" rel="noreferrer">
            Image source: Random Image API <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function OpponentPage() {
  const navigate = useNavigate();

  function handleStartGame(event) {
    event.preventDefault();
    const settings = new URLSearchParams(new FormData(event.currentTarget));
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
              <GameModeOptions />
              <BotSettings />
              <button className="btn btn-primary start-button" type="submit">Start game <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </section>
        <PlayerCard />
      </form>
    </main>
  );
}