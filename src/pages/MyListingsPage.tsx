import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, AlertCircle, Search } from 'lucide-react';
import { getMyListings, deleteListing, updateListingStatus } from '../api/listings';
import { searchTenants } from '../api/user';
import { LISTING_TYPE_LABELS } from '../types';
import type { Listing, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveImage(path: string | undefined): string {
  if (!path) return 'https://placehold.co/400x240?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'filled', label: 'Filled' },
];

function statusStyle(s?: string) {
  if (s === 'available') return 'bg-emerald-100 text-emerald-700';
  if (s === 'unavailable') return 'bg-amber-100 text-amber-700';
  if (s === 'filled') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-500';
}

function statusLabel(s?: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s ?? '—';
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status editing
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState('');
  const [tenantQuery, setTenantQuery] = useState('');
  const [tenantResults, setTenantResults] = useState<User[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [tenantSearching, setTenantSearching] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getMyListings()
      .then((data) =>
        setListings(data.filter((l) => l.is_active !== false && l.is_active !== 0))
      )
      .catch(() => setError('Failed to load your listings.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setError('Failed to delete listing. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openStatusEdit = (listing: Listing) => {
    setEditingStatusId(listing.id);
    setDraftStatus(listing.status ?? 'available');
    setTenantQuery('');
    setTenantResults([]);
    setSelectedTenant(null);
    setError('');
  };

  const closeStatusEdit = () => {
    setEditingStatusId(null);
    setTenantQuery('');
    setTenantResults([]);
    setSelectedTenant(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
  };

  const handleTenantSearch = (query: string) => {
    setTenantQuery(query);
    setSelectedTenant(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) { setTenantResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setTenantSearching(true);
      try {
        const results = await searchTenants(query);
        setTenantResults(results);
      } finally {
        setTenantSearching(false);
      }
    }, 300);
  };

  const handleSaveStatus = async (listingId: string) => {
    if (draftStatus === 'filled' && !selectedTenant) {
      setError('Please select the tenant who rented this listing.');
      return;
    }
    setStatusSaving(true);
    try {
      await updateListingStatus(
        listingId,
        draftStatus,
        selectedTenant ? Number(selectedTenant.id) : undefined
      );
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, status: draftStatus as Listing['status'] } : l
        )
      );
      closeStatusEdit();
    } catch {
      setError('Failed to update status. Please try again.');
    } finally {
      setStatusSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-40 text-gray-400">Loading your listings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>
        <Link
          to="/post-listing"
          className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-900 transition"
        >
          <Plus size={16} />
          Post New Listing
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
          <p className="text-gray-400 mb-4">You haven't posted any listings yet.</p>
          <Link
            to="/post-listing"
            className="inline-flex items-center gap-2 bg-red-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900 transition"
          >
            <Plus size={16} />
            Post Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div
                  className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0 bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/listings/${listing.id}`)}
                >
                  <img
                    src={resolveImage(listing.images?.[0])}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              listing.type === 'looking_for_roommate'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {LISTING_TYPE_LABELS[listing.type]}
                          </span>
                          {listing.status && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle(listing.status)}`}>
                              {statusLabel(listing.status)}
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-semibold text-gray-900 mt-1 cursor-pointer hover:text-red-800 transition"
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        >
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500">{listing.location}</p>
                      </div>
                      <p className="text-red-800 font-bold text-lg whitespace-nowrap">
                        RM{listing.price.toLocaleString()}
                        <span className="text-gray-400 font-normal text-sm">/mo</span>
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Posted {new Date(listing.createdAt ?? (listing as unknown as Record<string, string>).created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {confirmDeleteId === listing.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Delete this listing?</span>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleting}
                          className="text-sm px-3 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/listings/${listing.id}/edit`)}
                          className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            editingStatusId === listing.id
                              ? closeStatusEdit()
                              : openStatusEdit(listing)
                          }
                          className={`text-sm px-3 py-1.5 border rounded-lg transition ${
                            editingStatusId === listing.id
                              ? 'border-red-200 text-red-700 bg-red-50'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Change Status
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(listing.id)}
                          className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline status edit panel */}
              {editingStatusId === listing.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
                  {/* Status select */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setDraftStatus(opt.value);
                            if (opt.value !== 'filled') {
                              setTenantQuery('');
                              setTenantResults([]);
                              setSelectedTenant(null);
                            }
                          }}
                          className={`text-sm px-3 py-1.5 rounded-full border transition ${
                            draftStatus === opt.value
                              ? `${statusStyle(opt.value)} border-current font-semibold`
                              : 'border-gray-300 text-gray-600 hover:bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tenant search — only when filled */}
                  {draftStatus === 'filled' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Select the tenant who rented this listing:
                      </p>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={tenantQuery}
                          onChange={(e) => handleTenantSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                      </div>

                      {tenantSearching && (
                        <p className="text-xs text-gray-400">Searching...</p>
                      )}

                      {!tenantSearching && tenantQuery.length >= 2 && !selectedTenant && tenantResults.length === 0 && (
                        <p className="text-xs text-gray-400 px-1">No users found for "{tenantQuery}".</p>
                      )}

                      {tenantResults.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto shadow-sm">
                          {tenantResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedTenant(user);
                                setTenantQuery(user.name);
                                setTenantResults([]);
                              }}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                            >
                              <span className="font-medium text-gray-900">{user.name}</span>
                              <span className="text-gray-400 ml-2">{user.email}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedTenant && (
                        <p className="text-xs text-emerald-600 font-medium">
                          Selected: {selectedTenant.name} ({selectedTenant.email})
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveStatus(listing.id)}
                      disabled={statusSaving}
                      className="text-sm px-4 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition disabled:opacity-50"
                    >
                      {statusSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={closeStatusEdit}
                      className="text-sm px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
