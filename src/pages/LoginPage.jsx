import { Link } from 'react-router-dom';

function MiniBoard() {
  return (
    <div className="mini-board" aria-hidden="true">
      <span>X</span><span></span><span>O</span>
      <span></span><span>X</span><span></span>
      <span>O</span><span></span><span>X</span>
    </div>
  );
}

function SignInForm() {
  return (
    <div className="card auth-panel">
      <div className="card-body">
        <p className="eyebrow">Player sign-in</p>
        <h2>Welcome back</h2>
        <form action="/api/auth/login" method="post">
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-control" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-control" id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
          </div>
          <button className="btn btn-primary w-100" type="submit">Sign in <span aria-hidden="true">→</span></button>
        </form>
        <p className="account-prompt">New around here? <Link to="/bots">Create an account</Link></p>
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
          <MiniBoard />
        </section>
        <section className="col-lg-5 offset-lg-1" aria-label="Sign in">
          <SignInForm />
        </section>
      </div>
    </main>
  );
}