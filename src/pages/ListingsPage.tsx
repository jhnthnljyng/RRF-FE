import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/common/ListingCard';
import SearchBar from '../components/common/SearchBar';
import { useListingStore } from '../store/listingStore';
import { getListings } from '../api/listings';
import type { SearchFilters } from '../types';

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, isLoading, error, setListings, setLoading, setError } = useListingStore();

  const filters: SearchFilters = {
    type: (searchParams.get('type') as SearchFilters['type']) ?? '',
    location: searchParams.get('location') ?? '',
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListings(filters);
        setListings(data);
      } catch {
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleSearch = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.location) params.set('location', newFilters.location);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Listings</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {isLoading && (
        <div className="text-center py-20 text-gray-400">Loading listings...</div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No listings found. Try adjusting your filters.
        </div>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
