import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { Listing } from '../../types';
import { LISTING_TYPE_LABELS } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { addFavourite, removeFavourite } from '../../api/favourites';

interface Props {
  listing: Listing;
}

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveImage(path: string | undefined): string {
  if (!path) return 'https://placehold.co/400x240?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export default function ListingCard({ listing }: Props) {
  const [index, setIndex] = useState(0);
  const [isFav, setIsFav] = useState(listing.is_favourited ?? false);
  const [favLoading, setFavLoading] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const images = listing.images.length > 0 ? listing.images : [undefined];
  const total = images.length;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + total) % total);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % total);
  };

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    const prev = isFav;
    setIsFav(!isFav);
    try {
      if (prev) {
        await removeFavourite(listing.id);
      } else {
        await addFavourite(listing.id);
      }
    } catch {
      setIsFav(prev);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={resolveImage(images[index])}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
            >
              <ChevronRight size={16} />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`block w-1.5 h-1.5 rounded-full transition ${i === index ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${
            listing.type === 'room' || listing.type === 'whole_unit'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {LISTING_TYPE_LABELS[listing.type]}
        </span>

        {isAuthenticated && (
          <button
            onClick={toggleFav}
            disabled={favLoading}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow transition disabled:opacity-50"
          >
            <Heart
              size={16}
              className={isFav ? 'text-red-600 fill-red-600' : 'text-gray-500'}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
        <p className="text-sm text-gray-500 mt-1 truncate">{listing.location}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-red-800 font-bold">
            RM{listing.price.toLocaleString()}
            <span className="text-gray-400 font-normal text-sm">/mo</span>
          </span>
          {listing.furnishing && listing.furnishing !== 'unfurnished' && (
            <span className="text-xs text-gray-500">
              {listing.furnishing === 'fully' ? 'Fully Furnished' : 'Partial Furnished'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
