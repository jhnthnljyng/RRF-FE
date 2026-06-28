import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { getListing, updateListing, uploadImages } from '../api/listings';
import { useAuthStore } from '../store/authStore';
import type { ListingType } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveImage(path: string): string {
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

const BASE_AMENITIES = ['WiFi', 'Air Conditioning', 'Washing Machine', 'Parking', 'Kitchen', 'Water Heater', 'Security'];
const FURNISHED_AMENITIES = ['Dryer', 'Water Dispenser', 'Bed', 'Wardrobe', 'Table', 'Refrigerator'];

const OWNER_TYPES: { value: ListingType; label: string; desc: string }[] = [
  { value: 'room', label: 'Room for Rent', desc: 'Rent out a single bedroom in your property' },
  { value: 'whole_unit', label: 'Whole Unit for Rent', desc: 'Rent out an entire apartment, condo, or house' },
];

const TENANT_TYPES: { value: ListingType; label: string; desc: string }[] = [
  { value: 'room', label: 'Room for Rent', desc: 'Subletting a room from the unit you currently rent' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate', desc: 'Have a space and looking for someone to share with' },
];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'tenant';
  const typeOptions = role === 'owner' ? OWNER_TYPES : TENANT_TYPES;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    type: typeOptions[0].value as ListingType,
    title: '',
    description: '',
    price: '',
    location: '',
    furnishing: 'unfurnished' as 'fully' | 'partial' | 'unfurnished',
    bedrooms: '',
    bathrooms: '',
    maxOccupants: '',
    availableFrom: '',
    genderPreference: 'any' as 'any' | 'male' | 'female',
    amenities: [] as string[],
  });

  // Existing images (paths already on server)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // New image files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load existing listing
  useEffect(() => {
    if (!id) return;
    getListing(id)
      .then((l) => {
        setForm({
          type: l.type,
          title: l.title,
          description: l.description,
          price: String(l.price),
          location: l.location,
          furnishing: l.furnishing ?? 'unfurnished',
          bedrooms: l.bedrooms != null ? String(l.bedrooms) : '',
          bathrooms: l.bathrooms != null ? String(l.bathrooms) : '',
          maxOccupants: l.maxOccupants != null ? String(l.maxOccupants) : '',
          availableFrom: l.availableFrom?.split('T')[0] ?? '',
          genderPreference: l.genderPreference ?? 'any',
          amenities: l.amenities ?? [],
        });
        setExistingImages(l.images ?? []);
      })
      .catch(() => setLoadError('Failed to load listing.'))
      .finally(() => setIsLoadingData(false));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const combined = [...newImageFiles, ...files].slice(0, 10 - existingImages.length);
    setNewImageFiles(combined);
    setNewImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setIsLoading(true);

    try {
      let newPaths: string[] = [];
      if (newImageFiles.length > 0) {
        try {
          newPaths = await uploadImages(newImageFiles);
        } catch {
          // upload not ready — proceed without new images
        }
      }

      await updateListing(id, {
        type: form.type,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        furnishing: form.furnishing,
        availableFrom: form.availableFrom,
        genderPreference: form.genderPreference,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        maxOccupants: form.maxOccupants ? Number(form.maxOccupants) : undefined,
        amenities: form.amenities,
        images: [...existingImages, ...newPaths],
      });

      navigate('/my-listings');
    } catch {
      setError('Failed to update listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="text-center py-40 text-gray-400">Loading...</div>;
  }

  if (loadError) {
    return (
      <div className="text-center py-40">
        <p className="text-red-500 mb-4">{loadError}</p>
        <Link to="/my-listings" className="text-red-800 underline">Back to my listings</Link>
      </div>
    );
  }

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/my-listings" className="text-sm text-red-800 hover:underline mb-6 inline-block">
        &larr; Back to my listings
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Listing</h1>
      <p className="text-gray-500 mb-8">Update your listing details below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
          <div className="flex flex-col gap-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    type: opt.value,
                    ...(opt.value === 'room' && { bedrooms: '', bathrooms: '' }),
                  }))
                }
                className={`flex flex-col items-start px-4 py-3 rounded-lg border text-left transition ${
                  form.type === opt.value
                    ? 'bg-red-800 text-white border-red-800'
                    : 'border-gray-300 text-gray-700 hover:border-red-400'
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                <span className={`text-xs mt-0.5 ${form.type === opt.value ? 'text-red-200' : 'text-gray-400'}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos <span className="text-gray-400 font-normal">(up to 10)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {/* Existing images */}
            {existingImages.map((src, i) => (
              <div key={`existing-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={resolveImage(src)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* New image previews */}
            {newImagePreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {totalImages < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-red-400 hover:text-red-400 transition"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Add Photo</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" name="title" required value={form.title} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" name="location" required value={form.location} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (RM)</label>
          <input type="number" name="price" required min={0} value={form.price} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none"
          />
        </div>

        {/* Bedrooms / Bathrooms / Max Occupants */}
        {form.type === 'whole_unit' && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Bedrooms', name: 'bedrooms' },
              { label: 'Bathrooms', name: 'bathrooms' },
              { label: 'Max Occupants', name: 'maxOccupants' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="number" name={f.name} min={1}
                  value={form[f.name as keyof typeof form] as string}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            ))}
          </div>
        )}

        {form.type === 'room' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupants</label>
            <input type="number" name="maxOccupants" min={1} value={form.maxOccupants} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>
        )}

        {/* Available From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
          <input type="date" name="availableFrom" required
            value={form.availableFrom} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
          <select name="genderPreference" value={form.genderPreference} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
          <div className="flex flex-col gap-2">
            {([
              { value: 'fully', label: 'Fully Furnished' },
              { value: 'partial', label: 'Partial Furnished' },
            ] as const).map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.furnishing === opt.value}
                  onChange={() =>
                    setForm((prev) => {
                      const next = prev.furnishing === opt.value ? 'unfurnished' : opt.value;
                      return {
                        ...prev,
                        furnishing: next,
                        amenities: next === 'unfurnished'
                          ? prev.amenities.filter((a) => !FURNISHED_AMENITIES.includes(a))
                          : prev.amenities,
                      };
                    })
                  }
                  className="w-4 h-4 accent-red-800"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {form.furnishing !== 'unfurnished' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {[...BASE_AMENITIES, ...FURNISHED_AMENITIES].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    form.amenities.includes(a)
                      ? 'bg-red-800 text-white border-red-800'
                      : 'border-gray-300 text-gray-700 hover:border-red-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-800 text-white py-3 rounded-lg font-medium hover:bg-red-900 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
