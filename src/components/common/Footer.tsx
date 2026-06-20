import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-red-800">RoomFinder</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/listings" className="hover:text-gray-900">Browse</Link>
            <Link to="/post-listing" className="hover:text-gray-900">Post a Listing</Link>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} RoomFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
