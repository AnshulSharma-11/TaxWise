import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  registerRequest,
  getProfile,
  updateProfile as updateProfileRequest,
} from '../api/auth';
import { setUnauthorizedHandler, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(Boolean(token));

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      persist(null, null);
    });
  }, [persist]);

  // Re-hydrate the profile in the background so a stale cached name/PAN self-heals.
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    getProfile()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        /* handled globally via setUnauthorizedHandler for 401s */
      })
      .finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials);
      const { token: newToken, ...profile } = response;
      persist(newToken, profile);
      try {
        const fullProfile = await getProfile();
        persist(newToken, { ...profile, ...fullProfile });
        return { ...profile, ...fullProfile };
      } catch {
        return profile;
      }
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const response = await registerRequest(payload);
      const { token: newToken, ...profile } = response;
      persist(newToken, profile);
      try {
        const fullProfile = await getProfile();
        persist(newToken, { ...profile, ...fullProfile });
        return { ...profile, ...fullProfile };
      } catch {
        return profile;
      }
    },
    [persist]
  );

  const refreshProfile = useCallback(async () => {
    const profile = await getProfile();
    setUser((prev) => ({ ...prev, ...profile }));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const profile = await updateProfileRequest(payload);
    setUser((prev) => ({ ...prev, ...profile }));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [token, user, initializing, login, register, logout, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
