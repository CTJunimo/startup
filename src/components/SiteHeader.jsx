import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigation = [
    { to: '/', label: user ? 'Home' : 'Sign in', end: true },
    { to: '/bots', label: 'New game' },
    { to: '/play', label: 'Game board' },
    ...(user ? [{ to: '/scores', label: 'Match history' }] : []),
  ];

  return (
    <header className="site-header">
      <div className="container-xl header-inner">
        <NavLink className="brand" to="/" end>
          <span className="brand-mark" aria-hidden="true">XO</span>
          <span>Tic-Tac-Toe</span>
        </NavLink>
        <nav aria-label="Main navigation">
          <menu className="nav-list">
            {navigation.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  to={to}
                  end={end}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </menu>
        </nav>
        {user && (
          <div className="account-status">
            <span>{user.displayName}</span>
            <button className="header-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}