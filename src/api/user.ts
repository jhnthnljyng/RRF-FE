import api from './axios';
import type { User, Social, CookingFrequency } from '../types';

type RawUser = Record<string, unknown>;

function mapUser(u: RawUser): User {
  return {
    ...(u as unknown as User),
    name: (u.full_name ?? u.name) as string,
    avatar_url: (u.avatar_url ?? u.avatar) as string | undefined,
    smoking: Boolean(u.smoking),
    pet_owner: Boolean(u.pet_owner),
    pet_friendly: Boolean(u.pet_friendly),
    socials: (u.socials as Social[]) ?? [],
    createdAt: (u.created_at ?? u.createdAt) as string,
  };
}

// Handles { user }, { data }, or a bare user object
function extractUser(data: unknown): RawUser | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as RawUser;
  if (d.user && typeof d.user === 'object') return d.user as RawUser;
  if (d.data && typeof d.data === 'object') return d.data as RawUser;
  if (d.id || d.email) return d;
  return null;
}

export const getProfile = () =>
  api.get<unknown>('/user/profile').then((r) => {
    const raw = extractUser(r.data);
    if (!raw) throw new Error('Unexpected profile response format');
    return mapUser(raw);
  });

export interface ProfileUpdatePayload {
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  gender?: string;
  occupation?: string;
  nationality?: string;
  cooking_frequency?: CookingFrequency | '';
  smoking?: boolean;
  pet_owner?: boolean;
  pet_friendly?: boolean;
  socials?: Social[];
}

export const updateProfile = async (data: ProfileUpdatePayload): Promise<User> => {
  const response = await api.put<unknown>('/user/profile', {
    full_name: data.name,
    username: data.username,
    phone: data.phone,
    bio: data.bio,
    avatar_url: data.avatar_url,
    gender: data.gender,
    occupation: data.occupation,
    nationality: data.nationality,
    cooking_frequency: data.cooking_frequency || null,
    smoking: data.smoking ? 1 : 0,
    pet_owner: data.pet_owner ? 1 : 0,
    pet_friendly: data.pet_friendly ? 1 : 0,
    socials: data.socials,
  });

  const raw = extractUser(response.data);

  // If the backend returned the updated user, use it directly
  if (raw) return mapUser(raw);

  // Otherwise re-fetch to get fresh data
  return getProfile();
};

export const uploadAvatar = (file: File) => {
  const fd = new FormData();
  fd.append('images', file);
  return api
    .post<{ paths: string[] }>('/images/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.paths[0]);
};

export const changePassword = (data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => api.put('/user/password', data);

export const getPublicProfile = (id: string): Promise<User> =>
  api.get<unknown>(`/users/${id}`).then((r) => {
    const raw = extractUser(r.data);
    if (!raw) throw new Error('User not found');
    return mapUser(raw);
  });

export const searchTenants = (query: string): Promise<User[]> =>
  api.get<unknown>('/users/search', { params: { q: query } }).then((r) => {
    const data = r.data;
    if (Array.isArray(data)) return data as User[];
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.users)) return d.users as User[];
    if (Array.isArray(d.data)) return d.data as User[];
    return [];
  });
