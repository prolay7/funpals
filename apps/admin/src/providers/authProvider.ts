import { AuthProvider } from 'react-admin';
import { apiClient } from '@/api/client';

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const { data } = await apiClient.post('/auth/login', { email: username, password });
    if (data.user?.role !== 'admin') {
      throw new Error('Access denied: admin role required');
    }
    localStorage.setItem('adminToken', data.tokens.accessToken);
    localStorage.setItem('adminRefreshToken', data.tokens.refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    try {
      if (refreshToken) await apiClient.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
  },

  checkAuth: () => {
    return localStorage.getItem('adminToken') ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    const status = error?.status ?? error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const user = localStorage.getItem('adminUser');
    if (!user) return Promise.resolve(null);
    return Promise.resolve(JSON.parse(user).role ?? null);
  },

  getIdentity: async () => {
    const cached = localStorage.getItem('adminUser');
    if (cached) {
      const u = JSON.parse(cached);
      return {
        id: u.id,
        fullName: u.display_name ?? u.username,
        avatar: u.photo_url ?? undefined,
      };
    }
    const { data } = await apiClient.get('/users/me');
    const u = data.data ?? data;
    localStorage.setItem('adminUser', JSON.stringify(u));
    return {
      id: u.id,
      fullName: u.display_name ?? u.username,
      avatar: u.photo_url ?? undefined,
    };
  },
};
