import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getFavourites } from '../api/favourites';
import ListingCard from '../components/common/ListingCard';
import type { Listing } from '../types';

export default function FavouritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFavourites()
      .then(setListings)
      .catch(() => setError('Failed to load your favourites.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-40 text-gray-400">Loading favourites...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Favourites</h1>
        {!error && (
          <p className="text-sm text-gray-500 mt-1">
            {listings.length} saved {listings.length === 1 ? 'listing' : 'listings'}
          </p>
        )}
      </div>

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!error && listings.length === 0 && (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Heart size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No saved listings yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Tap the heart on any listing to save it here.
          </p>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-red-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900 transition"
          >
            Browse Listings
          </Link>
        </div>
      )}

      {!error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, is_favourited: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
