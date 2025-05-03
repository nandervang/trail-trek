import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Route, Lock, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import type { Database } from '@/types/supabase';

type Hike = Database['public']['Tables']['hikes']['Row'];

export default function SharedHike() {
  const { shareId } = useParams<{ shareId: string }>();
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  const { data: hike, isLoading } = useQuery({
    queryKey: ['shared-hike', shareId],
    queryFn: async () => {
      if (!shareId) {
        throw new Error('Share ID is required');
      }

      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('share_id', shareId)
        .eq('share_enabled', true)
        .single();

      if (error) throw error;
      return data as Hike;
    },
    enabled: !!shareId,
  });

  const checkPassword = () => {
    if (hike?.share_password === password) {
      setIsPasswordCorrect(true);
    } else {
      setPassword('');
      alert('Incorrect password');
    }
  };

  if (!shareId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Share Link</h1>
        <p className="text-gray-600 mb-8">
          This share link appears to be invalid.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hike) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hike Not Found</h1>
        <p className="text-gray-600 mb-8">
          This hike may have expired or been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  if (hike.share_password && !isPasswordCorrect) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Lock className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">
            This hike is password protected
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="input mb-4"
          />
          <button onClick={checkPassword} className="btn btn-primary w-full">
            View Hike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{hike.name}</h1>
              <Link 
                to={`/shared/${shareId}/planner`}
                className="btn btn-primary flex items-center"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                View Planner
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-1 mr-3"
                />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">
                    Dates
                  </h4>
                  <p className="text-xl">
                    {hike.start_date && hike.end_date
                      ? `${format(parseISO(hike.start_date), 'MMM d, yyyy')} - ${format(
                          parseISO(hike.end_date),
                          'MMM d, yyyy'
                        )}`
                      : hike.start_date 
                        ? format(parseISO(hike.start_date), 'MMM d, yyyy')
                        : 'Not set'}
                  </p>
                </div>
              </div>

              {hike.distance_miles && (
                <div className="flex items-start">
                  <Route className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">
                      Distance
                    </h4>
                    <p className="text-xl">{hike.distance_miles} miles</p>
                  </div>
                </div>
              )}

              {hike.start_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">
                      Starting Point
                    </h4>
                    <p className="text-xl">{hike.start_location}</p>
                  </div>
                </div>
              )}

              {hike.end_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">
                      Destination
                    </h4>
                    <p className="text-xl">{hike.end_location}</p>
                  </div>
                </div>
              )}
            </div>

            {hike.description && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-light mb-4">Description</h2>
                <p className="whitespace-pre-line">{hike.description}</p>
              </div>
            )}

            {hike.images && hike.images.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-light mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hike.images.map((url: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={hike.image_descriptions?.[index] || `Hike photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}