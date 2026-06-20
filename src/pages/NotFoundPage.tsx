import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-red-800 mb-4">404</h1>
      <p className="text-xl text-gray-900 mb-2">Page not found</p>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="bg-red-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-900 transition"
      >
        Go home
      </Link>
    </div>
  );
}
