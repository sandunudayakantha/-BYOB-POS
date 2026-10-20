import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Required to send httpOnly cookies cross-origin
});

// Request Interceptor — attach Access Token from memory (not localStorage)
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

const requestRefreshToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      withCredentials: true
    }).then(res => {
      const newAccessToken = res.data?.data?.access_token || res.data?.access_token;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
      }
      return newAccessToken;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Response Interceptor — normalize APIResponse envelope and auto-refresh
api.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      if (
        resData.data &&
        typeof resData.data === 'object' &&
        Array.isArray(resData.data.items) &&
        typeof resData.data.total === 'number' &&
        !('menu' in resData.data) &&
        !('categories' in resData.data)
      ) {
        const paginatedList = resData.data.items.map(item => ({
          ...item,
          _id: item._id || item.id
        }));
        return {
          ...resData,
          data: paginatedList,
          pagination: {
            total: resData.data.total,
            skip: resData.data.skip,
            limit: resData.data.limit,
          }
        };
      }
      if (resData.data && typeof resData.data === 'object' && !Array.isArray(resData.data)) {
        if ('id' in resData.data && !('_id' in resData.data)) {
          resData.data._id = resData.data.id;
        }
      }
    }
    return resData;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await requestRefreshToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearAccessToken();
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
