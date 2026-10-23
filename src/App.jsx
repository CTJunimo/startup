import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { MatchHistoryProvider } from './contexts/MatchHistoryContext.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OpponentPage from './pages/OpponentPage.jsx';
import PlayPage from './pages/PlayPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <MatchHistoryProvider>
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
      </MatchHistoryProvider>
    </AuthProvider>
  );
}