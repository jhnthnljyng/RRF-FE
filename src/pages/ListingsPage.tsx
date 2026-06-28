import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ListingCard from '../components/common/ListingCard';
import { useListingStore } from '../store/listingStore';
import { getListings } from '../api/listings';
import type { SearchFilters } from '../types';

const PAGE_SIZE = 9;

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'room', label: 'Room for Rent' },
  { value: 'whole_unit', label: 'Whole Unit for Rent' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate' },
];

const FURNISHING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'fully', label: 'Fully Furnished' },
  { value: 'partial', label: 'Partial' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const BATHROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
];

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, isLoading, error, setListings, setLoading, setError } = useListingStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Committed URL filter values
  const urlType = (searchParams.get('type') ?? '') as SearchFilters['type'];
  const urlLocation = searchParams.get('location') ?? '';
  const urlMinPrice = searchParams.get('minPrice') ?? '';
  const urlMaxPrice = searchParams.get('maxPrice') ?? '';
  const urlFurnishing = searchParams.get('furnishing') ?? '';
  const urlGender = searchParams.get('genderPreference') ?? '';
  const urlMinBedrooms = searchParams.get('minBedrooms') ?? '';
  const urlMinBathrooms = searchParams.get('minBathrooms') ?? '';
  const urlAvailableOnly = searchParams.get('availableOnly') === 'true';

  // Draft state
  const [draftType, setDraftType] = useState<SearchFilters['type']>(urlType);
  const [draftLocation, setDraftLocation] = useState(urlLocation);
  const [draftMinPrice, setDraftMinPrice] = useState(urlMinPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(urlMaxPrice);
  const [draftFurnishing, setDraftFurnishing] = useState(urlFurnishing);
  const [draftGender, setDraftGender] = useState(urlGender);
  const [draftMinBedrooms, setDraftMinBedrooms] = useState(urlMinBedrooms);
  const [draftMinBathrooms, setDraftMinBathrooms] = useState(urlMinBathrooms);
  const [draftAvailableOnly, setDraftAvailableOnly] = useState(urlAvailableOnly);

  const activeCount = [
    urlType, urlLocation, urlMinPrice, urlMaxPrice,
    urlFurnishing, urlGender, urlMinBedrooms, urlMinBathrooms,
  ].filter(Boolean).length + (urlAvailableOnly ? 1 : 0);

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (draftType) next.set('type', draftType);
    if (draftLocation.trim()) next.set('location', draftLocation.trim());
    if (draftMinPrice) next.set('minPrice', draftMinPrice);
    if (draftMaxPrice) next.set('maxPrice', draftMaxPrice);
    if (draftFurnishing) next.set('furnishing', draftFurnishing);
    if (draftGender) next.set('genderPreference', draftGender);
    if (draftMinBedrooms) next.set('minBedrooms', draftMinBedrooms);
    if (draftMinBathrooms) next.set('minBathrooms', draftMinBathrooms);
    if (draftAvailableOnly) next.set('availableOnly', 'true');
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setDraftType('');
    setDraftLocation('');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftFurnishing('');
    setDraftGender('');
    setDraftMinBedrooms('');
    setDraftMinBathrooms('');
    setDraftAvailableOnly(false);
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams.toString()]);

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

  const filteredListings = listings.filter((l) => {
    if (l.is_active === false || l.is_active === 0) return false;
    if (urlType && l.type !== urlType) return false;
    if (urlLocation && !l.location.toLowerCase().includes(urlLocation.toLowerCase())) return false;
    if (urlMinPrice && l.price < Number(urlMinPrice)) return false;
    if (urlMaxPrice && l.price > Number(urlMaxPrice)) return false;
    if (urlFurnishing && l.furnishing !== urlFurnishing) return false;
    if (urlGender && l.genderPreference && l.genderPreference !== urlGender) return false;
    if (urlMinBedrooms && (l.bedrooms === undefined || l.bedrooms < Number(urlMinBedrooms))) return false;
    if (urlMinBathrooms && (l.bathrooms === undefined || l.bathrooms < Number(urlMinBathrooms))) return false;
    if (urlAvailableOnly && l.status && l.status !== 'available') return false;
    return true;
  });

  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const chipClass = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
      active
        ? 'bg-red-800 text-white border-red-800'
        : 'border-gray-300 text-gray-600 hover:border-red-400'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Listings</h1>

      {/* Filter panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-4">

        {/* Row 1: Type + Location + Search + Clear */}
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

        <div className="border-t border-gray-100" />

        {/* Row 2: Price + Furnishing + Gender */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Price (RM)</span>
            <input
              type="number" min={0} placeholder="Min" value={draftMinPrice}
              onChange={(e) => setDraftMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number" min={0} placeholder="Max" value={draftMaxPrice}
              onChange={(e) => setDraftMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Furnishing</span>
            <div className="flex flex-wrap gap-1">
              {FURNISHING_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setDraftFurnishing(opt.value)}
                  className={chipClass(draftFurnishing === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Gender</span>
            <div className="flex flex-wrap gap-1">
              {GENDER_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setDraftGender(opt.value)}
                  className={chipClass(draftGender === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Row 3: Bedrooms + Bathrooms + Available only */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Bedrooms</span>
            <div className="flex flex-wrap gap-1">
              {BEDROOM_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setDraftMinBedrooms(opt.value)}
                  className={chipClass(draftMinBedrooms === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Bathrooms</span>
            <div className="flex flex-wrap gap-1">
              {BATHROOM_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setDraftMinBathrooms(opt.value)}
                  className={chipClass(draftMinBathrooms === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setDraftAvailableOnly((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                draftAvailableOnly ? 'bg-red-800' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  draftAvailableOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Available only</span>
          </label>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredListings.length)} of {filteredListings.length} listings
        </p>
      )}

      {isLoading && <div className="text-center py-20 text-gray-400">Loading listings...</div>}
      {error && <div className="text-center py-20 text-red-500">{error}</div>}

      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No listings found. Try adjusting your filters.
        </div>
      )}

      {!isLoading && !error && paginatedListings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              {pageNumbers.map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-3 py-2 text-sm text-gray-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm rounded-lg border transition ${
                      currentPage === page
                        ? 'bg-red-800 text-white border-red-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
