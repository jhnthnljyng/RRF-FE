import api from './axios';
import type { Listing } from '../types';

export const getFavourites = (): Promise<Listing[]> =>
  api.get<unknown>('/favourites').then((r) => {
    const data = r.data;
    if (Array.isArray(data)) return data as Listing[];
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.favourites)) return d.favourites as Listing[];
    if (Array.isArray(d.data)) return d.data as Listing[];
    return [];
  });

export const addFavourite = (listingId: string) =>
  api.post('/favourites', { listing_id: Number(listingId) });

export const removeFavourite = (listingId: string) =>
  api.delete(`/favourites/${listingId}`);
