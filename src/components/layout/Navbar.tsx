import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-lg sm:text-xl font-bold text-primary-600">TrailTrek</span>
              </Link>
            </div>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/hikes"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Hikes
              </Link>
              <Link
                to="/gear"
                className="border-transparent text-gray-600 hover:text-gray-900 hover:border-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Gear
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}