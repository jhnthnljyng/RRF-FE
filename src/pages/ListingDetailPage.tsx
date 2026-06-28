import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useListingStore } from '../store/listingStore';
import { getListing } from '../api/listings';
import { LISTING_TYPE_LABELS } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function formatWhatsAppNumber(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60')) return digits;
  if (digits.startsWith('0')) return '6' + digits;
  return '60' + digits;
}

function resolveImage(path: string | undefined): string {
  if (!path) return 'https://placehold.co/800x480?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [imgIndex, setImgIndex] = useState(0);
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
        setImgIndex(0);
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
  const images = l.images.length > 0 ? l.images : [undefined];
  const total = images.length;

  const prevImg = () => setImgIndex((i) => (i - 1 + total) % total);
  const nextImg = () => setImgIndex((i) => (i + 1) % total);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/listings" className="text-sm text-red-800 hover:underline mb-6 inline-block">
        &larr; Back to listings
      </Link>

      {/* Image carousel */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-8 h-72 sm:h-96">
        <img
          src={resolveImage(images[imgIndex])}
          alt={l.title}
          className="w-full h-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === imgIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                />
              ))}
            </div>

            <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {imgIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setImgIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === imgIndex ? 'border-red-800' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                l.type === 'room' || l.type === 'whole_unit'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {LISTING_TYPE_LABELS[l.type]}
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
              {l.furnishing && (
                <li>Furnishing: <span className="font-medium text-gray-900">
                  {l.furnishing === 'fully' ? 'Fully Furnished' : l.furnishing === 'partial' ? 'Partial Furnished' : 'Unfurnished'}
                </span></li>
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

            {(() => {
              const number = formatWhatsAppNumber(l.owner_phone ?? l.author?.phone);
              const url = number
                ? `https://wa.me/${number}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${l.title}" on RoomFinder.`)}`
                : null;
              return url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Contact on WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="mt-5 w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl font-medium cursor-not-allowed"
                >
                  Contact info not available
                </button>
              );
            })()}
          </div>

          <Link
            to={`/users/${l.owner_id}`}
            className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-red-200 hover:shadow-sm transition group"
          >
            <p className="text-sm font-semibold text-gray-900 mb-1">Posted by</p>
            <p className="text-gray-700 font-medium group-hover:text-red-800 transition">
              {l.owner_name ?? l.author?.name ?? `Owner #${l.owner_id}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(l.createdAt ?? (l as unknown as Record<string,string>).created_at).toLocaleDateString()}
            </p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
