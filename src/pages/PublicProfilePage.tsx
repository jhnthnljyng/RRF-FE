import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserRound, CalendarDays, ExternalLink } from 'lucide-react';
import { getPublicProfile } from '../api/user';
import { getListings } from '../api/listings';
import ListingCard from '../components/common/ListingCard';
import type { User, Listing } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveAvatar(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

const COOKING_LABELS: Record<string, string> = {
  never: 'Never cooks',
  rarely: 'Rarely cooks',
  sometimes: 'Cooks sometimes',
  often: 'Cooks often',
  daily: 'Cooks daily',
};

function LifestyleTag({ label, yes }: { label: string; yes: boolean }) {
  return (
    <span
      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
        yes ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {yes ? '✓' : '✗'} {label}
    </span>
  );
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      getPublicProfile(id),
      getListings().catch(() => [] as Listing[]),
    ])
      .then(([u, all]) => {
        setUser(u);
        setListings(
          all.filter(
            (l) =>
              String(l.owner_id) === id &&
              l.is_active !== false &&
              l.is_active !== 0
          )
        );
      })
      .catch(() => setError('User not found.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-40 text-gray-400">Loading profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="text-center py-40">
        <p className="text-red-500 mb-4">{error ?? 'User not found.'}</p>
        <Link to="/listings" className="text-red-800 underline">
          Back to listings
        </Link>
      </div>
    );
  }

  const avatarSrc = resolveAvatar(user.avatar_url);
  const hasAbout = user.gender || user.occupation || user.nationality;
  const hasLifestyle =
    user.cooking_frequency ||
    user.smoking !== undefined ||
    user.pet_owner !== undefined ||
    user.pet_friendly !== undefined;
  const hasSocials = user.socials && user.socials.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Hero card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-100">
                <UserRound size={40} className="text-gray-300" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {user.username && (
              <p className="text-gray-500 mt-0.5">@{user.username}</p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-sm text-gray-400">
              <CalendarDays size={14} />
              <span>
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString('en-MY', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            {user.bio && (
              <p className="mt-4 text-gray-600 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* About + Lifestyle */}
      {(hasAbout || hasLifestyle) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* About */}
          {hasAbout && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">About</h2>
              <ul className="space-y-2.5 text-sm">
                {user.gender && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium text-gray-900 capitalize">{user.gender}</span>
                  </li>
                )}
                {user.occupation && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Occupation</span>
                    <span className="font-medium text-gray-900">{user.occupation}</span>
                  </li>
                )}
                {user.nationality && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Nationality</span>
                    <span className="font-medium text-gray-900">{user.nationality}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Lifestyle */}
          {hasLifestyle && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Lifestyle</h2>
              <div className="flex flex-wrap gap-2">
                {user.cooking_frequency && (
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-amber-100 text-amber-700">
                    🍳 {COOKING_LABELS[user.cooking_frequency] ?? user.cooking_frequency}
                  </span>
                )}
                {user.smoking !== undefined && (
                  <LifestyleTag label="Smoker" yes={user.smoking} />
                )}
                {user.pet_owner !== undefined && (
                  <LifestyleTag label="Has pets" yes={user.pet_owner} />
                )}
                {user.pet_friendly !== undefined && (
                  <LifestyleTag label="Pet friendly" yes={user.pet_friendly} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social links */}
      {hasSocials && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="flex flex-wrap gap-2">
            {user.socials!.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-4 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-red-300 hover:text-red-800 transition"
              >
                {s.name}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      {listings.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            Listings by {user.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
