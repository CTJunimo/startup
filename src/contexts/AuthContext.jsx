import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

async function requestAuth(path, options = {}) {
  const response = await fetch(`/api/auth/${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || 'Unable to update your account. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error('Unable to restore your account session.');
        return response.json();
      })
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function signIn(email, _displayName, password) {
    try {
      const currentUser = await requestAuth('login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(currentUser);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  async function register(displayName, email, password) {
    try {
      const currentUser = await requestAuth('create', {
        method: 'POST',
        body: JSON.stringify({ displayName, email, password }),
      });
      setUser(currentUser);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  async function signOut() {
    try {
      await requestAuth('logout', { method: 'DELETE' });
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}