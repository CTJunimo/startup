import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="site-footer container-xl">
      <span>Three in a row. Your move.</span>
      {user && <Link to="/scores">Recent matches</Link>}
    </footer>
  );
}