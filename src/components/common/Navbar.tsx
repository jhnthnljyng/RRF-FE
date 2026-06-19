import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            RoomFinder
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/listings"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Browse Listings
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/post-listing"
                className={({ isActive }) =>
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'
                }
              >
                Post a Listing
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {user?.name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
