import { useRef, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserRound, KeyRound, Settings, LogOut, ChevronDown, LayoutList, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'http://localhost:8000/api')
  .replace(/\/api$/, '');

function resolveAvatar(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate('/');
  };

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const avatarSrc = user?.avatar_url ? resolveAvatar(user.avatar_url) : '';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-red-800">
            RoomFinder
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/listings"
              className={({ isActive }) =>
                isActive ? 'text-red-800 font-medium' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Browse Listings
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/post-listing"
                className={({ isActive }) =>
                  isActive ? 'text-red-800 font-medium' : 'text-gray-600 hover:text-gray-900'
                }
              >
                Post a Listing
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <UserRound size={18} className="text-gray-400" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-gray-700 font-medium">
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <button
                      onClick={() => go('/profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <UserRound size={15} className="text-gray-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => go('/my-listings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <LayoutList size={15} className="text-gray-400" />
                      My Listings
                    </button>
                    <button
                      onClick={() => go('/favourites')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Heart size={15} className="text-gray-400" />
                      Favourites
                    </button>
                    <button
                      onClick={() => go('/change-password')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <KeyRound size={15} className="text-gray-400" />
                      Change Password
                    </button>
                    <button
                      onClick={() => go('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings size={15} className="text-gray-400" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition"
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
