import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot'

  useEffect(() => {
    async function loadUser() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      console.error(e);
    }
  };

  const demoLogin = async (role = 'creator') => {
    if (role === 'admin') {
      return login('admin@fuziverse.com', 'admin123');
    } else if (role === 'creator') {
      return login('creator@fuziverse.com', 'creator123');
    } else {
      return login('listener@fuziverse.com', 'listener123');
    }
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCreator: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        demoLogin,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
