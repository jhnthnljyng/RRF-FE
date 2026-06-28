import api from './axios';
import type { AuthCredentials, AuthResponse, RegisterPayload } from '../types';

type RawAuthResponse = {
  token: string;
  user: Record<string, unknown>;
};

function mapAuthResponse(raw: RawAuthResponse): AuthResponse {
  const u = raw.user;
  return {
    token: raw.token,
    user: {
      ...(u as unknown as AuthResponse['user']),
      name: (u.full_name ?? u.name) as string,
      createdAt: (u.created_at ?? u.createdAt) as string,
    },
  };
}

export const login = (data: AuthCredentials) =>
  api.post<RawAuthResponse>('/auth/login', data).then((r) => mapAuthResponse(r.data));

export const register = (data: RegisterPayload) =>
  api
    .post<RawAuthResponse>('/auth/register', {
      username: data.username,
      full_name: data.fullname,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password,
    })
    .then((r) => mapAuthResponse(r.data));

export const logout = () => api.post('/auth/logout');

export const getMe = () =>
  api.get<AuthResponse['user']>('/auth/me').then((r) => r.data);
