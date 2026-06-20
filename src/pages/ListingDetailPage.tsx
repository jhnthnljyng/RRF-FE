import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useListingStore } from '../store/listingStore';
import { getListing } from '../api/listings';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedListing, isLoading, error, setSelectedListing, setLoading, setError } =
    useListingStore();

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListing(id);
        setSelectedListing(data);
      } catch {
        setError('Listing not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => setSelectedListing(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-40 text-gray-400">Loading...</div>;
  }

  if (error || !selectedListing) {
    return (
      <div className="text-center py-40">
        <p className="text-red-500 mb-4">{error ?? 'Listing not found.'}</p>
        <Link to="/listings" className="text-red-800 underline">Back to listings</Link>
      </div>
    );
  }

  const l = selectedListing;
  const placeholder = 'https://placehold.co/800x480?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/listings" className="text-sm text-red-800 hover:underline mb-6 inline-block">
        &larr; Back to listings
      </Link>

      {/* Images */}
      <div className="rounded-2xl overflow-hidden bg-gray-100 mb-8 h-72 sm:h-96">
        <img
          src={l.images[0] ?? placeholder}
          alt={l.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                l.type === 'room' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-700'
              }`}
            >
              {l.type === 'room' ? 'Room for Rent' : 'Looking for Roommate'}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{l.title}</h1>
            <p className="text-gray-500 mt-1">{l.location}</p>
          </div>

          <p className="text-gray-700 leading-relaxed">{l.description}</p>

          {l.amenities.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
              <ul className="flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <li key={a} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-3xl font-bold text-red-800">
              RM{l.price.toLocaleString()}
              <span className="text-base font-normal text-gray-400">/mo</span>
            </p>

            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {l.isFurnished !== undefined && (
                <li>Furnishing: <span className="font-medium text-gray-900">{l.isFurnished ? 'Furnished' : 'Unfurnished'}</span></li>
              )}
              {l.bedrooms !== undefined && (
                <li>Bedrooms: <span className="font-medium text-gray-900">{l.bedrooms}</span></li>
              )}
              {l.bathrooms !== undefined && (
                <li>Bathrooms: <span className="font-medium text-gray-900">{l.bathrooms}</span></li>
              )}
              {l.genderPreference && (
                <li>Gender Pref: <span className="font-medium text-gray-900 capitalize">{l.genderPreference}</span></li>
              )}
              <li>
                Available from:{' '}
                <span className="font-medium text-gray-900">
                  {new Date(l.availableFrom).toLocaleDateString()}
                </span>
              </li>
            </ul>

            <button className="mt-5 w-full bg-red-800 text-white py-2.5 rounded-xl font-medium hover:bg-red-900 transition">
              Contact Owner
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Posted by</p>
            <p className="text-gray-700">{l.author.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(l.createdAt).toLocaleDateString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
