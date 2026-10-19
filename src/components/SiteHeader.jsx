import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Sign in', end: true },
  { to: '/bots', label: 'New game' },
  { to: '/play', label: 'Game board' },
  { to: '/scores', label: 'Match history' },
];

export default function SiteHeader() {
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
      </div>
    </header>
  );
}