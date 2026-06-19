import api from './axios';
import type { Listing, SearchFilters } from '../types';

export const getListings = (filters?: SearchFilters) =>
  api.get<Listing[]>('/listings', { params: filters }).then((r) => r.data);

export const getListing = (id: string) =>
  api.get<Listing>(`/listings/${id}`).then((r) => r.data);

export const createListing = (data: Partial<Listing>) =>
  api.post<Listing>('/listings', data).then((r) => r.data);

export const updateListing = (id: string, data: Partial<Listing>) =>
  api.put<Listing>(`/listings/${id}`, data).then((r) => r.data);

export const deleteListing = (id: string) =>
  api.delete(`/listings/${id}`);

export const getMyListings = () =>
  api.get<Listing[]>('/listings/me').then((r) => r.data);
