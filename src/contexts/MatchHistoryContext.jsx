import { createContext, useContext, useEffect, useState } from 'react';

const MatchHistoryContext = createContext(null);
const historyKey = 'tic-tac-toe-match-history';

function readMatches() {
  try {
    const matches = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
    return Array.isArray(matches) ? matches.filter((match) => match.email !== 'guest@local') : [];
  } catch {
    return [];
  }
}

export function MatchHistoryProvider({ children }) {
  const [matches, setMatches] = useState(readMatches);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    function syncHistory(event) {
      if (event.key === historyKey) setMatches(readMatches());
    }

    window.addEventListener('storage', syncHistory);
    return () => window.removeEventListener('storage', syncHistory);
  }, []);

  function recordMatch(match) {
    if (!match.email || match.email === 'guest@local') return;
    setMatches((currentMatches) => {
      if (currentMatches.some((item) => item.id === match.id)) return currentMatches;
      return [match, ...currentMatches].slice(0, 50);
    });
  }

  function clearHistory(email) {
    setMatches((currentMatches) => currentMatches.filter((match) => match.email !== email));
  }

  return (
    <MatchHistoryContext.Provider value={{ matches, recordMatch, clearHistory }}>
      {children}
    </MatchHistoryContext.Provider>
  );
}

export function useMatchHistory() {
  const context = useContext(MatchHistoryContext);
  if (!context) throw new Error('useMatchHistory must be used within MatchHistoryProvider');
  return context;
}