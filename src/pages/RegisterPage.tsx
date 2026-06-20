import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    username: '',
    fullname: '',
    email: '',
    phone: '',
    role: 'tenant' as 'owner' | 'tenant',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { user, token } = await register({
        username: form.username,
        fullname: form.fullname,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password,
      });
      setAuth(user, token);
      navigate('/');
    } catch {
      setError('Registration failed. Email or username may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-500 mb-8">Join RoomFinder and start finding rooms</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              value={form.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="e.g. john_doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullname"
              required
              value={form.fullname}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="Full Name as IC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))
              }
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="e.g. 0123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="flex gap-4">
              {(['tenant', 'owner'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 flex-1 border rounded-lg px-4 py-3 cursor-pointer transition ${
                    form.role === r
                      ? 'border-red-800 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={handleChange}
                    className="accent-red-800"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-800 text-white py-2.5 rounded-lg font-medium hover:bg-red-900 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
