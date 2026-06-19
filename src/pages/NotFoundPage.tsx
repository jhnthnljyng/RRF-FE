import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-xl text-gray-900 mb-2">Page not found</p>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Go home
      </Link>
    </div>
  );
}
