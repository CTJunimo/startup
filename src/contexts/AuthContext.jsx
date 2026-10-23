import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const sessionKey = 'tic-tac-toe-session';
const profilesKey = 'tic-tac-toe-profiles';
const passwordIterations = 120000;

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: passwordIterations,
    hash: 'SHA-256',
  }, key, 256);
  return encodeBase64(bits);
}

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
  if (!session || typeof session.email !== 'string') return null;
  const profiles = readStoredValue(profilesKey, {});
  const profile = profiles[session.email];
  if (!profile || typeof profile !== 'object' || !profile.passwordHash) return null;
  return { email: session.email, displayName: profile.displayName };
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

  async function signIn(email, displayName, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim().slice(0, 28);
    const profiles = readStoredValue(profilesKey, {});
    const profile = profiles[normalizedEmail];
    if (!profile || typeof profile !== 'object' || !profile.passwordHash) {
      return { error: 'No account exists for that email. Create an account first.' };
    }

    const passwordHash = await hashPassword(password, decodeBase64(profile.salt));
    if (passwordHash !== profile.passwordHash || normalizedName.toLowerCase() !== profile.displayName.toLowerCase()) {
      return { error: 'Name, email, or password does not match this account.' };
    }

    setUser({ email: normalizedEmail, displayName: profile.displayName });
    return { error: null };
  }

  async function register(displayName, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim().slice(0, 28);
    const profiles = readStoredValue(profilesKey, {});
    if (profiles[normalizedEmail]?.passwordHash) {
      return { error: 'An account already exists for that email. Sign in instead.' };
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    profiles[normalizedEmail] = {
      displayName: normalizedName,
      salt: encodeBase64(salt),
      passwordHash: await hashPassword(password, salt),
    };
    localStorage.setItem(profilesKey, JSON.stringify(profiles));
    setUser({ email: normalizedEmail, displayName: normalizedName });
    return { error: null };
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