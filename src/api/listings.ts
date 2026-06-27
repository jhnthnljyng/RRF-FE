import api from './axios';
import type { Listing, SearchFilters } from '../types';

export const getListings = (filters?: SearchFilters) =>
  api.get<{ listings: Listing[]; total: number }>('/listings', { params: filters })
    .then((r) => r.data.listings);

export const getListing = (id: string) =>
  api.get<Listing | { listing: Listing }>(`/listings/${id}`).then((r) => {
    const data = r.data as Record<string, unknown>;
    return (data.listing ?? r.data) as Listing;
  });

export const uploadImages = (files: File[]) => {
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));
  return api.post<{ paths: string[] }>('/images/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.paths);
};

export const createListing = (data: Partial<Listing>) =>
  api.post<Listing>('/listings', data).then((r) => r.data);

export const updateListing = (id: string, data: Partial<Listing>) =>
  api.put<Listing>(`/listings/${id}`, data).then((r) => r.data);

export const deleteListing = (id: string) =>
  api.delete(`/listings/${id}`);

export const getMyListings = () =>
  api.get<Listing[]>('/listings/me').then((r) => r.data);
