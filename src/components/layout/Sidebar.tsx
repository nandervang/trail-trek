import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Map, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  
  // Close sidebar when route changes
  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [location.pathname]);
  
  if (!open) return null;
  
  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
      />
      
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-full sm:w-64 bg-white overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary-600">
            TrailTrek
          </Link>
          <button
            onClick={onClose}
            className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <nav className="mt-5 px-4 space-y-1">
          <Link
            to="/"
            className={`group flex items-center px-2 py-3 text-base font-medium rounded-md ${
              location.pathname === '/' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="mr-3 h-5 w-5 text-gray-500" />
            Dashboard
          </Link>
          
          <Link
            to="/hikes"
            className={`group flex items-center px-2 py-3 text-base font-medium rounded-md ${
              location.pathname.startsWith('/hikes') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Map className="mr-3 h-5 w-5 text-gray-500" />
            Hikes
          </Link>
          
          <Link
            to="/hikes/new"
            className="group flex items-center px-2 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 pl-10"
          >
            <Plus className="mr-3 h-5 w-5 text-gray-500" />
            Plan New Hike
          </Link>
          
          <Link
            to="/gear"
            className={`group flex items-center px-2 py-3 text-base font-medium rounded-md ${
              location.pathname.startsWith('/gear') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Package className="mr-3 h-5 w-5 text-gray-500" />
            Gear
          </Link>
          
          <Link
            to="/gear/new"
            className="group flex items-center px-2 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 pl-10"
          >
            <Plus className="mr-3 h-5 w-5 text-gray-500" />
            Add New Gear
          </Link>
        </nav>
      </motion.div>
    </>
  );
}