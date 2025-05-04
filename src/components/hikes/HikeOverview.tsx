import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Route, Mountain, Package, ChevronUp, ChevronDown, Scale, Utensils, Shirt, Tent } from 'lucide-react';
import { formatWeight } from '@/utils/weight';

interface HikeOverviewProps {
  hike: any;
  baseWeight: number;
  totalWeight: number;
  expanded: boolean;
  onToggle: () => void;
  foodWeight?: number;
  wearableWeight?: number;
  bigThreeWeight?: number;
}

export default function HikeOverview({ 
  hike, 
  baseWeight, 
  totalWeight, 
  expanded, 
  onToggle,
  foodWeight = 0,
  wearableWeight = 0,
  bigThreeWeight = 0
}: HikeOverviewProps) {
  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return format(parseISO(date), 'MMM d, yyyy');
  };

  const formatCoordinates = (coords: [number, number] | null) => {
    if (!coords) return null;
    return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-xl font-light flex items-center">
          <Route className="h-6 w-6 mr-3 text-primary-600" />
          Overview
        </h2>
        {expanded ? (
          <ChevronUp className="h-6 w-6 text-gray-400" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Dates</h4>
                  <p className="text-lg">
                    {hike.start_date && hike.end_date 
                      ? `${formatDate(hike.start_date)} - ${formatDate(hike.end_date)}`
                      : formatDate(hike.start_date)}
                  </p>
                </div>
              </div>

              {hike.distance_km && (
                <div className="flex items-start">
                  <Route className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Distance</h4>
                    <p className="text-lg">{hike.distance_km} km</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Mountain className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Elevation Gain</h4>
                  <p className="text-lg">{hike.elevation_gain || 0}m</p>
                </div>
              </div>

              {(hike.start_location || hike.start_coordinates) && (
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting Point</h4>
                    <p className="text-lg">{hike.start_location}</p>
                    {hike.start_coordinates && (
                      <p className="text-sm text-gray-500">{formatCoordinates(hike.start_coordinates)}</p>
                    )}
                  </div>
                </div>
              )}

              {(hike.end_location || hike.end_coordinates) && (
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Destination</h4>
                    <p className="text-lg">{hike.end_location}</p>
                    {hike.end_coordinates && (
                      <p className="text-sm text-gray-500">{formatCoordinates(hike.end_coordinates)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <Package className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Pack Weight</h4>
                  <p className="text-lg">
                    {formatWeight(baseWeight)} base • {formatWeight(totalWeight)} total
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Tent className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Big Three</h4>
                  <p className="text-lg">{formatWeight(bigThreeWeight)}</p>
                  <p className="text-sm text-gray-500">Shelter, Pack, Sleep System</p>
                </div>
              </div>

              <div className="flex items-start">
                <Shirt className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Worn Weight</h4>
                  <p className="text-lg">{formatWeight(wearableWeight)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Utensils className="h-6 w-6 text-primary-600 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Food Weight</h4>
                  <p className="text-lg">{formatWeight(foodWeight)}</p>
                </div>
              </div>
            </div>
          </div>

          {hike.description && (
            <div className="mt-8">
              <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Description</h4>
              <p className="text-lg whitespace-pre-line">{hike.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}