import { create } from 'zustand';
import type { Listing, SearchFilters } from '../types';

interface ListingState {
  listings: Listing[];
  selectedListing: Listing | null;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  setListings: (listings: Listing[]) => void;
  setSelectedListing: (listing: Listing | null) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  selectedListing: null,
  filters: {},
  isLoading: false,
  error: null,
  setListings: (listings) => set({ listings }),
  setSelectedListing: (listing) => set({ selectedListing: listing }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
