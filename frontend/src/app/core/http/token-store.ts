/**
 * Unified Access Token Store (Single source of truth)
 * Supports in-memory caching with sessionStorage backup across tab refreshes.
 */
const SESSION_ACCESS_TOKEN_KEY = 'byob_pos_access_token';

let _accessToken: string | null = (typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY) : null);

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (!_accessToken && typeof window !== 'undefined') {
    _accessToken = sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY);
  }
  return _accessToken;
};

export const clearAccessToken = (): void => {
  _accessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
  }
};
