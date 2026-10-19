import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OpponentPage from './pages/OpponentPage.jsx';
import PlayPage from './pages/PlayPage.jsx';

export default function App() {
  return (
    <HashRouter>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/bots" element={<OpponentPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/scores" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SiteFooter />
    </HashRouter>
  );
}