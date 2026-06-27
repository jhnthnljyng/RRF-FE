import { useState, useEffect } from 'react';
import type { SearchFilters } from '../../types';

interface Props {
  onSearch: (filters: Pick<SearchFilters, 'type' | 'location'>) => void;
  initialType?: SearchFilters['type'];
  initialLocation?: string;
}

export default function SearchBar({ onSearch, initialType = '', initialLocation = '' }: Props) {
  const [location, setLocation] = useState(initialLocation);
  const [type, setType] = useState<SearchFilters['type']>(initialType);

  useEffect(() => { setLocation(initialLocation); }, [initialLocation]);
  useEffect(() => { setType(initialType ?? ''); }, [initialType]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ location, type });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl shadow-md w-full max-w-2xl"
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as SearchFilters['type'])}
        className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
      >
        <option value="">All Types</option>
        <option value="room">Room for Rent</option>
        <option value="whole_unit">Whole Unit for Rent</option>
        <option value="looking_for_roommate">Looking for Roommate</option>
      </select>

      <input
        type="text"
        placeholder="Search by location..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-700"
      />

      <button
        type="submit"
        className="bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-900 transition"
      >
        Search
      </button>
    </form>
  );
}
