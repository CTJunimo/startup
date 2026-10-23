import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteFooter from './components/SiteFooter.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { MatchHistoryProvider } from './contexts/MatchHistoryContext.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OpponentPage from './pages/OpponentPage.jsx';
import PlayPage from './pages/PlayPage.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <MatchHistoryProvider>
        <HashRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/bots" element={<ProtectedRoute><OpponentPage /></ProtectedRoute>} />
            <Route path="/play" element={<ProtectedRoute><PlayPage /></ProtectedRoute>} />
            <Route path="/scores" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SiteFooter />
        </HashRouter>
      </MatchHistoryProvider>
    </AuthProvider>
  );
}