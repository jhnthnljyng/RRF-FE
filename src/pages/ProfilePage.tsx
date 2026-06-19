import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="text-center py-40 text-gray-400">
        You are not logged in.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {user.bio && (
          <p className="text-gray-700 text-sm border-t border-gray-100 pt-4">{user.bio}</p>
        )}

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/post-listing')}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Post a Listing
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
