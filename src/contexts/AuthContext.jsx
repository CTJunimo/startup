import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const sessionKey = 'tic-tac-toe-session';
const profilesKey = 'tic-tac-toe-profiles';

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readSession() {
  const session = readStoredValue(sessionKey, null);
  return session && typeof session.email === 'string' ? session : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  useEffect(() => {
    if (user) {
      localStorage.setItem(sessionKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(sessionKey);
    }
  }, [user]);

  useEffect(() => {
    function syncSession(event) {
      if (event.key === sessionKey) setUser(readSession());
    }

    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  function signIn(email, displayName) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim().slice(0, 28);
    const profiles = readStoredValue(profilesKey, {});
    profiles[normalizedEmail] = normalizedName;
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    setUser({ email: normalizedEmail, displayName: normalizedName });
  }

  function register(displayName, email) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim().slice(0, 28);
    const profiles = readStoredValue(profilesKey, {});
    profiles[normalizedEmail] = normalizedName;
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    setUser({ email: normalizedEmail, displayName: normalizedName });
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}