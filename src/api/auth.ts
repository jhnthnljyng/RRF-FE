import api from './axios';
import type { AuthCredentials, AuthResponse, RegisterPayload } from '../types';

export const login = (data: AuthCredentials) =>
  api.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterPayload) =>
  api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const logout = () => api.post('/auth/logout');

export const getMe = () =>
  api.get<AuthResponse['user']>('/auth/me').then((r) => r.data);
