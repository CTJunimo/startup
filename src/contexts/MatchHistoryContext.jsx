import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const MatchHistoryContext = createContext(null);

export function MatchHistoryProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!user) {
      setMatches([]);
      setError('');
      return () => { active = false; };
    }

    fetch('/api/matches', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load match history.');
        return response.json();
      })
      .then((savedMatches) => {
        if (active) setMatches(savedMatches);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, [authLoading, user]);

  const recordMatch = useCallback(async (match) => {
    if (!user) return;
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || 'Could not save this match.');
      setMatches(result);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/matches', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Could not clear match history.');
      setMatches([]);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  return (
    <MatchHistoryContext.Provider value={{ matches, recordMatch, clearHistory, error }}>
      {children}
    </MatchHistoryContext.Provider>
  );
}

export function useMatchHistory() {
  const context = useContext(MatchHistoryContext);
  if (!context) throw new Error('useMatchHistory must be used within MatchHistoryProvider');
  return context;
}