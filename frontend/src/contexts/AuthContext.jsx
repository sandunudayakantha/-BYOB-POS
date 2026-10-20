import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setAccessToken, getAccessToken, clearAccessToken } from '../services/tokenStore';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const verifyUser = async () => {
      try {
        const existingAccessToken = getAccessToken();
        const storedRefreshToken = localStorage.getItem('refreshToken');

        // 1. If we already have an access token preserved in session, verify it directly
        if (existingAccessToken) {
          try {
            const meRes = await api.get('/auth/me');
            const currentUser = meRes.data?.user || meRes.data;
            if (currentUser) {
              currentUser._id = currentUser._id || currentUser.id;
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
              return;
            }
          } catch (e) {
            // Token expired or invalid, fall through to refresh
          }
        }

        // 2. If no valid access token, attempt cookie-based refresh
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true,
          });
          const tokenData = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = tokenData.access_token || tokenData.accessToken;

          if (newAccessToken) {
            setAccessToken(newAccessToken);
            const meRes = await api.get('/auth/me');
            const currentUser = meRes.data?.user || meRes.data;
            if (currentUser) {
              currentUser._id = currentUser._id || currentUser.id;
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
            }
          } else {
            setUser(null);
          }
        } catch {
          // No active session cookie or refresh failed
          setUser(null);
        }
      } catch {
        clearAccessToken();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const tokenData = res.data?.data || res.data;
    const user = tokenData.user;
    if (user) {
      user._id = user._id || user.id;
    }
    const accessToken = tokenData.access_token || tokenData.accessToken;

    if (accessToken) setAccessToken(accessToken);
    // Refresh token is safely set in HttpOnly cookie by backend
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    }
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAccessToken();
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
