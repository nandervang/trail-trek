import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Calendar, MapPin, Route, ChevronRight, Share2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import ShareHikeModal from '@/components/ShareHikeModal';
import DeleteHikeModal from '@/components/hikes/DeleteHikeModal';
import { toast } from 'sonner';

type Hike = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  type: string | null;
  start_location: string | null;
  end_location: string | null;
  distance_km: number | null;
  status: string;
};

export default function HikeList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: hikes, isLoading } = useQuery({
    queryKey: ['hikes', statusFilter],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      let query = supabase
        .from('hikes')
        .select('*')
        .eq('user_id', user.id);
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Sort by date - upcoming hikes first, then recently completed
      query = query.order('start_date', { ascending: statusFilter !== 'completed' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Hike[];
    },
    enabled: !!user,
  });

  const deleteHike = useMutation({
    mutationFn: async (hikeId: string) => {
      const { error } = await supabase
        .from('hikes')
        .delete()
        .eq('id', hikeId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      toast.success('Hike deleted successfully');
      setShowDeleteModal(false);
      setSelectedHike(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete hike: ${error.message}`);
    },
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-secondary-100 text-secondary-800';
      case 'in_progress':
        return 'bg-warning-100 text-warning-800';
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Hikes</h1>
        <Link to="/hikes/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" /> Plan New Hike
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex overflow-x-auto space-x-2 p-1">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            All Hikes
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === 'planned'
                ? 'bg-secondary-100 text-secondary-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter('planned')}
          >
            Planned
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === 'in_progress'
                ? 'bg-warning-100 text-warning-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter('in_progress')}
          >
            In Progress
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-success-100 text-success-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === 'canceled'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setStatusFilter('canceled')}
          >
            Canceled
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : hikes && hikes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {hikes.map((hike) => (
            <motion.div
              key={hike.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card overflow-hidden hover:shadow-card-hover relative group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHike(hike);
                  setShowDeleteModal(true);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold line-clamp-1">{hike.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(hike.status)}`}>
                    {getStatusText(hike.status)}
                  </span>
                </div>
                
                {hike.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{hike.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {hike.start_date && hike.end_date 
                        ? `${formatDate(hike.start_date)} - ${formatDate(hike.end_date)}`
                        : hike.start_date 
                          ? `Starting ${formatDate(hike.start_date)}`
                          : 'No dates set'}
                    </span>
                  </div>
                  
                  {hike.start_location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">{hike.start_location}</span>
                    </div>
                  )}
                  
                  {hike.distance_km && (
                    <div className="flex items-center">
                      <Route className="h-4 w-4 mr-2" />
                      <span>{hike.distance_km} km</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between items-center">
                <Link 
                  to={`/hikes/${hike.id}`}
                  className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center"
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedHike(hike);
                    setShowShareModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hikes found</h3>
          <p className="text-gray-500 mb-6">
            {statusFilter !== 'all'
              ? `You don't have any ${getStatusText(statusFilter).toLowerCase()} hikes.`
              : "You haven't planned any hikes yet."}
          </p>
          <Link to="/hikes/new" className="btn btn-primary">
            Plan Your First Hike
          </Link>
        </motion.div>
      )}

      {selectedHike && (
        <>
          <ShareHikeModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setSelectedHike(null);
            }}
            hike={selectedHike}
          />

          <DeleteHikeModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedHike(null);
            }}
            onConfirm={() => deleteHike.mutate(selectedHike.id)}
            hikeName={selectedHike.name}
          />
        </>
      )}
    </div>
  );
}