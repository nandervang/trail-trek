import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PackageCheck, User } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine if a path is active (for styling)
  const isActive = (basePath: string) => {
    return path === basePath || path.startsWith(`${basePath}/`);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-1 px-2 flex justify-around items-center z-40 lg:hidden">
      <Link to="/" className={`flex flex-col items-center text-xs py-1 ${isActive('/') ? 'text-primary-600' : 'text-gray-600'}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>
      
      <Link to="/hikes" className={`flex flex-col items-center text-xs py-1 ${isActive('/hikes') ? 'text-primary-600' : 'text-gray-600'}`}>
        <Map size={20} />
        <span>Hikes</span>
      </Link>
      
      <Link to="/gear" className={`flex flex-col items-center text-xs py-1 ${isActive('/gear') ? 'text-primary-600' : 'text-gray-600'}`}>
        <PackageCheck size={20} />
        <span>Gear</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center text-xs py-1 ${isActive('/profile') ? 'text-primary-600' : 'text-gray-600'}`}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </div>
  );
}