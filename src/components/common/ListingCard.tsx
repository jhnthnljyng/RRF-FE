import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { LISTING_TYPE_LABELS } from '../../types';

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const placeholder = 'https://placehold.co/400x240?text=No+Image';

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={listing.images[0] ?? placeholder}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${
            listing.type === 'room' || listing.type === 'whole_unit'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {LISTING_TYPE_LABELS[listing.type]}
        </span>
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
