import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function MiniBoard() {
  return (
    <div className="mini-board" aria-hidden="true">
      <span className="mini-mark-x">X</span><span></span><span className="mini-mark-o">O</span>
      <span></span><span className="mini-mark-x">X</span><span></span>
      <span className="mini-mark-o">O</span><span></span><span className="mini-mark-x">X</span>
    </div>
  );
}

function SignInForm() {
  const { user, signIn, register, signOut } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('sign-in');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get('email'));
    const displayName = String(fields.get('displayName')).trim();
    const password = String(fields.get('password'));

    if (!displayName) {
      setError('Enter your name to continue.');
      return;
    }

    const result = mode === 'register'
      ? await register(displayName, email, password)
      : await signIn(email, displayName, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    navigate('/bots');
  }

  if (user) {
    return (
      <div className="card auth-panel">
        <div className="card-body">
          <p className="eyebrow">Player account</p>
          <h2>Welcome, {user.displayName}</h2>
          <p className="lead-copy account-email">{user.email}</p>
          <Link className="btn btn-primary w-100" to="/bots">Start a game <span aria-hidden="true">→</span></Link>
          <button className="text-action signout-action" type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card auth-panel">
      <div className="card-body">
        <p className="eyebrow">{mode === 'register' ? 'Create player account' : 'Player sign-in'}</p>
        <h2>{mode === 'register' ? 'Join the game' : 'Welcome back'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="display-name">Name</label>
            <input className="form-control" id="display-name" name="displayName" type="text" autoComplete="name" maxLength={28} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-control" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-control" id="password" name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={6} placeholder="At least 6 characters" required />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary w-100" type="submit">{mode === 'register' ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></button>
        </form>
        <p className="account-prompt">
          {mode === 'register' ? 'Already have an account?' : 'New around here?'}{' '}
          <button className="text-action" type="button" onClick={() => { setMode(mode === 'register' ? 'sign-in' : 'register'); setError(''); }}>
            {mode === 'register' ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        <div className="guest-divider"><span>or</span></div>
        <Link className="btn btn-outline-secondary w-100 guest-entry" to="/bots">Continue as guest <span aria-hidden="true">→</span></Link>
        <p className="demo-note">Account details stay in this browser. Passwords are stored as salted hashes.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="container-xl page-shell">
      <div className="row align-items-center g-4">
        <section className="col-lg-6 welcome-copy">
          <p className="eyebrow">A little friendly rivalry</p>
          <h1>Make your<br /><span>next move.</span></h1>
          <p className="lead-copy">Quick matches, clever opponents, and a fresh chance to win.</p>
          <div className="author-attribution">
            <span>Created by CTJunimo</span>
            <a href="https://github.com/CTJunimo/startup" target="_blank" rel="noreferrer">View startup on GitHub <span aria-hidden="true">↗</span></a>
          </div>
          <MiniBoard />
        </section>
        <section className="col-lg-5 offset-lg-1" aria-label="Sign in">
          <SignInForm />
        </section>
      </div>
    </main>
  );
}