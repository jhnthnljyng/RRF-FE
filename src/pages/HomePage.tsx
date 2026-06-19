import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import type { SearchFilters } from '../types';

export default function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.location) params.set('location', filters.location);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Room or Roommate
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Browse verified listings across Malaysia. Post for free, connect instantly.
          </p>
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          What are you looking for?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/listings?type=room')}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 transition group"
          >
            <span className="text-5xl">🏠</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                Rooms for Rent
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Browse available rooms from landlords and tenants
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/listings?type=roommate')}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-green-100 hover:border-green-400 hover:bg-green-50 transition group"
          >
            <span className="text-5xl">🤝</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600">
                Looking for Roommate
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Find compatible housemates to share your space
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            Why RoomFinder?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '✅', title: 'Verified Listings', desc: 'All listings are reviewed to keep the platform trustworthy.' },
              { icon: '💬', title: 'Direct Messaging', desc: 'Contact landlords or tenants directly — no middlemen.' },
              { icon: '🆓', title: 'Free to Post', desc: 'Post your room or roommate listing at no cost.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
