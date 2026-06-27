import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { useAuthStore } from '../../store/authStore';
import { getProfile } from '../../api/user';

export default function Layout() {
  const { isAuthenticated, updateUser, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    getProfile()
      .then((user) => updateUser(user))
      .catch((err) => {
        // 401 means token is invalid/expired — log the user out
        if (err?.response?.status === 401) clearAuth();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
