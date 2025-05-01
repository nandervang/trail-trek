import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Edit, Package, ChevronDown, ChevronUp,
  ListChecks, FileText, Image as ImageIcon, MapPin, 
  Calendar, Route, Plus, Menu, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import HikeGear from './HikeGear';
import HikeLogs from '@/components/HikeLogs';
import ImageGallery from '@/components/ImageGallery';
import { uploadImage } from '@/lib/storage';
import { toast } from 'sonner';
import WeightChart from '@/components/WeightChart';
import { formatWeight } from '@/utils/weight';
import LogModal from '@/components/LogModal';

export default function HikeDetails() {
  const { id } = useParams<{ id: string }>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    gear: false,
    food: false,
    logs: false,
    tasks: false,
    completion: false,
    gallery: false,
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: hike, isLoading } = useQuery({
    queryKey: ['hike', id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid request");
      
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hike || !id) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAllSections = (expanded: boolean) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = expanded;
      });
      // Keep details section expanded
      newState.details = true;
      return newState;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const MobileQuickActions = () => (
    <div className="lg:hidden">
      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className="mobile-menu-item"
          onClick={() => toggleSection('tasks')}
        >
          <ListChecks className="h-6 w-6 mb-1" />
          Tasks
        </button>
        <button 
          className="mobile-menu-item"
          onClick={() => toggleSection('gear')}
        >
          <Package className="h-6 w-6 mb-1" />
          Gear
        </button>
        <Link 
          to={`/hikes/${id}/log`}
          className="mobile-menu-item"
        >
          <Plus className="h-6 w-6 mb-1" />
          Add Log
        </Link>
        <button 
          className="mobile-menu-item"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6 mb-1" />
          More
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Menu</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link 
                to={`/hikes/${id}/planner`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Planner
              </Link>
              <Link 
                to={`/hikes/${id}/edit`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Edit Hike
              </Link>
              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(v => v);
                  toggleAllSections(!allExpanded);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/hikes" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-light">{hike.name}</h1>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={() => toggleAllSections(!Object.values(expandedSections).every(v => v))}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
          </button>
          <Link to={`/hikes/${id}/planner`} className="btn btn-outline">
            View Planner
          </Link>
          <Link to={`/hikes/${id}/edit`} className="btn btn-primary">
            <Edit className="h-4 w-4 mr-2" /> Edit Hike
          </Link>
        </div>
      </div>

      {/* Overview Section */}
      <div className="card mb-8">
        <div 
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => toggleSection('details')}
        >
          <h2 className="text-xl font-light flex items-center">
            <Route className="h-5 w-5 mr-2 text-primary-900" />
            Overview
          </h2>
          {expandedSections.details ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.details && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Dates</h4>
                  <p className="text-xl">
                    {hike.start_date && hike.end_date 
                      ? `${formatDate(hike.start_date)} - ${formatDate(hike.end_date)}`
                      : formatDate(hike.start_date)}
                  </p>
                </div>
              </div>

              {hike.distance_miles && (
                <div className="flex items-start">
                  <Route className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Distance</h4>
                    <p className="text-xl">{hike.distance_miles} miles</p>
                  </div>
                </div>
              )}

              {hike.start_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting Point</h4>
                    <p className="text-xl">{hike.start_location}</p>
                  </div>
                </div>
              )}

              {hike.end_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Destination</h4>
                    <p className="text-xl">{hike.end_location}</p>
                  </div>
                </div>
              )}
            </div>

            {hike.description && (
              <div className="mt-6">
                <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Description</h4>
                <p className="text-lg whitespace-pre-line">{hike.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="card mb-8">
        <div 
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => toggleSection('tasks')}
        >
          <h2 className="text-xl font-light flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-primary-900" />
            Preparation Tasks
          </h2>
          {expandedSections.tasks ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.tasks && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            {/* Tasks content */}
          </div>
        )}
      </div>

      {/* Gear Section */}
      <div className="card mb-8">
        <div 
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => toggleSection('gear')}
        >
          <h2 className="text-xl font-light flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary-900" />
            Gear List
          </h2>
          {expandedSections.gear ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.gear && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            <HikeGear hikeId={id} />
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="card mb-8">
        <div 
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => toggleSection('logs')}
        >
          <h2 className="text-xl font-light flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-900" />
            Trail Logs
          </h2>
          {expandedSections.logs ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.logs && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            <div className="flex justify-end mb-6">
              <Link to={`/hikes/${id}/log`} className="btn btn-primary">
                Add Log Entry
              </Link>
            </div>
            
            <HikeLogs 
              hikeId={id} 
              onLogClick={(log) => setSelectedLog(log)}
            />
          </div>
        )}
      </div>

      {/* Image Gallery Section */}
      <div className="card mb-8">
        <div 
          className="flex justify-between items-center p-6 cursor-pointer"
          onClick={() => toggleSection('gallery')}
        >
          <h2 className="text-xl font-light flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-primary-900" />
            Image Gallery
          </h2>
          {expandedSections.gallery ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        
        {expandedSections.gallery && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6">
            <ImageGallery
              images={hike.images || []}
              descriptions={hike.image_descriptions || []}
              onImagesChange={() => {}}
              onUpload={() => {}}
            />
          </div>
        )}
      </div>

      {/* Mobile Quick Actions */}
      <MobileQuickActions />

      {/* Log Modal */}
      <LogModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
        hikeId={id}
      />
    </div>
  );
}