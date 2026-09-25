import { api } from './api';
import { ApiResponse, User } from '../types';

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: async (name: string, email: string, password: string, avatarUrl?: string) => {
    const res = await api.post<ApiResponse<AuthData>>('/auth/register', {
      name,
      email,
      password,
      avatarUrl,
    });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<AuthData>>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },
};
