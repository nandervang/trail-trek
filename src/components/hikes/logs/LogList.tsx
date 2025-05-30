import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FileText, Calendar, MapPin, Plus, ChevronDown, ChevronUp, CloudSun, CloudRain, Cloud, Sun } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Log } from './types';

interface LogListProps {
  hikeId: string;
  onLogClick?: (log: Log) => void;
  viewOnly?: boolean; // New prop to disable editing functionality
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  partly_cloudy: CloudSun,
  rainy: CloudRain,
};

const moodEmojis = ['😫', '😕', '😐', '🙂', '😊'];
const difficultyLabels = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'];

export default function LogList({ hikeId, viewOnly = false, onLogClick }: LogListProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  console.log(viewOnly);


  const { data: logs, isLoading } = useQuery({
    queryKey: ['hike-logs', hikeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hike_logs')
        .select('*')
        .eq('hike_id', hikeId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Log[];
    },
  });

  const toggleLog = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0 && !viewOnly) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">No log entries yet</p>
        <Link to={`/hikes/${hikeId}/log`} className="btn btn-primary">
          Add Your First Entry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div 
          key={log.id} 
          className="bg-white rounded-lg shadow-sm border border-gray-100"
        >
          {/* Header - Always visible */}
          <div 
            className="flex items-center justify-between cursor-pointer p-4"
            onClick={() => toggleLog(log.id)}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {log.title || format(parseISO(log.date), 'MMMM d, yyyy')}
                </h3>
                {log.distance_km && (
                  <span className="text-gray-600 ml-4">
                    {log.distance_km.toFixed(1)} km
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(parseISO(log.date), 'MMM d, yyyy')}
                  {log.time && ` at ${log.time}`}
                </div>
                {log.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {log.location}
                  </div>
                )}
              </div>
            </div>
            {expandedLogId === log.id ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {/* Expanded Content */}
          {expandedLogId === log.id && (
            <div className="border-t border-gray-100 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {log.temperature !== null && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Temperature</h4>
                    <p className="text-lg">{log.temperature}°C</p>
                  </div>
                )}

                {log.conditions && log.conditions.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {log.conditions.map((condition) => {
                        const Icon = weatherIcons[condition as keyof typeof weatherIcons];
                        return (
                          <span 
                            key={condition}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {Icon && <Icon className="h-3 w-3 mr-1" />}
                            {condition.replace('_', ' ')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {log.mood && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Mood</h4>
                    <p className="text-2xl">{moodEmojis[log.mood - 1]}</p>
                  </div>
                )}

                {log.difficulty && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Difficulty</h4>
                    <p className="text-lg">{difficultyLabels[log.difficulty - 1]}</p>
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="mb-6">
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Notes</h4>
                  <div data-color-mode="light">
                    <MDEditor.Markdown source={log.notes} />
                  </div>
                </div>
              )}

              {log.images && log.images.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {log.images.map((url, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Log photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => onLogClick?.(log)}
                  className="btn btn-primary"
                >
                  Edit Log
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Mobile Add Log Button */}
      <Link 
        to={`/hikes/${hikeId}/log`}
        className="mobile-fab lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}