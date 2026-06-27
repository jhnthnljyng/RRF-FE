import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ListingCard from '../components/common/ListingCard';
import { useListingStore } from '../store/listingStore';
import { getListings } from '../api/listings';
import type { SearchFilters } from '../types';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'room', label: 'Room for Rent' },
  { value: 'whole_unit', label: 'Whole Unit for Rent' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate' },
];

const FURNISHING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'fully', label: 'Fully Furnished' },
  { value: 'partial', label: 'Partial Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, isLoading, error, setListings, setLoading, setError } = useListingStore();

  // Committed values from URL
  const urlType = (searchParams.get('type') ?? '') as SearchFilters['type'];
  const urlLocation = searchParams.get('location') ?? '';
  const urlMinPrice = searchParams.get('minPrice') ?? '';
  const urlMaxPrice = searchParams.get('maxPrice') ?? '';
  const urlFurnishing = searchParams.get('furnishing') ?? '';
  const urlGender = searchParams.get('genderPreference') ?? '';

  // Draft state — only committed on Search click
  const [draftType, setDraftType] = useState<SearchFilters['type']>(urlType);
  const [draftLocation, setDraftLocation] = useState(urlLocation);
  const [draftMinPrice, setDraftMinPrice] = useState(urlMinPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(urlMaxPrice);
  const [draftFurnishing, setDraftFurnishing] = useState(urlFurnishing);
  const [draftGender, setDraftGender] = useState(urlGender);

  const activeCount = [urlType, urlLocation, urlMinPrice, urlMaxPrice, urlFurnishing, urlGender]
    .filter(Boolean).length;

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (draftType) next.set('type', draftType);
    if (draftLocation.trim()) next.set('location', draftLocation.trim());
    if (draftMinPrice) next.set('minPrice', draftMinPrice);
    if (draftMaxPrice) next.set('maxPrice', draftMaxPrice);
    if (draftFurnishing) next.set('furnishing', draftFurnishing);
    if (draftGender) next.set('genderPreference', draftGender);
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setDraftType('');
    setDraftLocation('');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftFurnishing('');
    setDraftGender('');
    setSearchParams({}, { replace: true });
  };

  // Fetch all listings once on mount — all filtering is done client-side
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListings();
        setListings(data);
      } catch {
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filtering (covers what the backend may not implement)
  const filteredListings = listings.filter((l) => {
    if (urlType && l.type !== urlType) return false;
    if (urlLocation && !l.location.toLowerCase().includes(urlLocation.toLowerCase())) return false;
    if (urlMinPrice && l.price < Number(urlMinPrice)) return false;
    if (urlMaxPrice && l.price > Number(urlMaxPrice)) return false;
    if (urlFurnishing && l.furnishing !== urlFurnishing) return false;
    if (urlGender && l.genderPreference && l.genderPreference !== urlGender) return false;
    return true;
  });

  const chipClass = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
      active
        ? 'bg-red-800 text-white border-red-800'
        : 'border-gray-300 text-gray-600 hover:border-red-400'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Listings</h1>

      {/* Unified filter panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-4">

        {/* Row 1: Type + Location + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as SearchFilters['type'])}
            className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by location..."
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700"
          />

          <button
            onClick={applyFilters}
            className="flex items-center gap-2 bg-red-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-900 transition"
          >
            <Search size={15} />
            Search
          </button>

          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-800 transition px-2"
            >
              <X size={14} />
              Clear ({activeCount})
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Row 2: Price + Furnishing + Gender */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

          {/* Price range */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Price (RM)</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={draftMinPrice}
              onChange={(e) => setDraftMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={draftMaxPrice}
              onChange={(e) => setDraftMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          {/* Furnishing */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Furnishing</span>
            <div className="flex flex-wrap gap-1">
              {FURNISHING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraftFurnishing(opt.value)}
                  className={chipClass(draftFurnishing === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          {/* Gender preference */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Gender</span>
            <div className="flex flex-wrap gap-1">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraftGender(opt.value)}
                  className={chipClass(draftGender === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
        </p>
      )}

      {isLoading && (
        <div className="text-center py-20 text-gray-400">Loading listings...</div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No listings found. Try adjusting your filters.
        </div>
      )}

      {!isLoading && !error && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
