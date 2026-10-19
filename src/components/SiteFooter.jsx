import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer container-xl">
      <span>Three in a row. Your move.</span>
      <Link to="/scores">Recent matches</Link>
    </footer>
  );
}