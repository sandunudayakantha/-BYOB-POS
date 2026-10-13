/**
 * Re-export the unified token store to avoid desynchronization between legacy and new modules
 */
export { setAccessToken, getAccessToken, clearAccessToken } from '../app/core/http/token-store';
