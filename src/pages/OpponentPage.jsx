import { useEffect, useState } from 'react';
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
  const [profileImage, setProfileImage] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileImage('');
      setImageError(false);
      return undefined;
    }

    let active = true;
    fetch('https://randomuser.me/api/?inc=picture&noinfo')
      .then((response) => {
        if (!response.ok) throw new Error('The profile image service is unavailable.');
        return response.json();
      })
      .then((data) => {
        const image = data.results?.[0]?.picture?.large;
        if (!image) throw new Error('The profile image service returned no image.');
        if (active) setProfileImage(image);
      })
      .catch(() => {
        if (active) setImageError(true);
      });
    return () => { active = false; };
  }, [user]);

  return (
    <section className="col-lg-5" aria-labelledby="profile-heading">
      <div className="card profile-panel h-100">
        <div className="card-body">
          {user ? (
            <>
              <p className="eyebrow">Your player card</p>
              <h2 id="profile-heading">Ready to play, {user.displayName}?</h2>
              <figure className="profile-figure">
                <img
                  src={profileImage && !imageError ? profileImage : profilePlaceholder}
                  alt="Random profile avatar"
                  onError={() => setImageError(true)}
                />
                <figcaption>{imageError ? 'Profile image unavailable; showing a placeholder.' : 'A profile image from Random User Generator.'}</figcaption>
              </figure>
              <a className="api-link" href="https://randomuser.me/" target="_blank" rel="noreferrer">
                Image source: Random User Generator <span aria-hidden="true">↗</span>
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