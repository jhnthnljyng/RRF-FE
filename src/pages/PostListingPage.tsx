import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../api/listings';

const AMENITIES_OPTIONS = ['WiFi', 'Air Conditioning', 'Washing Machine', 'Parking', 'Kitchen', 'Water Heater', 'Security'];

export default function PostListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'room' as 'room' | 'roommate',
    title: '',
    description: '',
    price: '',
    location: '',
    isFurnished: false,
    bedrooms: '',
    bathrooms: '',
    availableFrom: '',
    genderPreference: 'any' as 'any' | 'male' | 'female',
    amenities: [] as string[],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const listing = await createListing({
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        images: [],
      });
      navigate(`/listings/${listing.id}`);
    } catch {
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a Listing</h1>
      <p className="text-gray-500 mb-8">Fill in the details below to list your room or find a roommate.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
          <div className="flex gap-3">
            {(['room', 'roommate'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                  form.type === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {t === 'room' ? 'Room for Rent' : 'Looking for Roommate'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Cozy room near LRT Taman Jaya"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            required
            value={form.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Petaling Jaya, Selangor"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (RM)</label>
          <input
            type="number"
            name="price"
            required
            min={0}
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 800"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe the room, house rules, nearby facilities..."
          />
        </div>

        {/* Bedrooms / Bathrooms / Furnished */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              min={1}
              value={form.bedrooms}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              min={1}
              value={form.bathrooms}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Available From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
          <input
            type="date"
            name="availableFrom"
            required
            value={form.availableFrom}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
          <select
            name="genderPreference"
            value={form.genderPreference}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Furnished */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isFurnished"
            checked={form.isFurnished}
            onChange={handleChange}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-gray-700">Furnished</span>
        </label>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`text-sm px-3 py-1.5 rounded-full border transition ${
                  form.amenities.includes(a)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}
