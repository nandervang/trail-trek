import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  value?: string;
  coordinates?: [number, number];
  onChange: (location: string, coordinates: [number, number]) => void;
  label: string;
}

// Fix for default marker icon
const icon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ value, coordinates, onChange, label }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(coordinates || null);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (coordinates) {
      setPosition(coordinates);
    }
    if (value) {
      setSearchQuery(value);
    }
  }, [value, coordinates]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const coordinates: [number, number] = [
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
    ];
    setPosition(coordinates);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    onChange(suggestion.display_name, coordinates);
    setShowMap(true);
  };

  const handleMapClick = async (latlng: LatLng) => {
    const coordinates: [number, number] = [latlng.lat, latlng.lng];
    setPosition(coordinates);
    
    try {
      // Reverse geocode to get location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      
      // Update both the search query and trigger the onChange with coordinates
      setSearchQuery(data.display_name);
      onChange(data.display_name, coordinates);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Even if reverse geocoding fails, still save the coordinates
      onChange(searchQuery, coordinates);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">{label}</label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10"
                placeholder="Search for a location or click on map..."
              />
              <MapPin className="absolute left-0 top-3 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="btn btn-outline ml-2"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        {position && (
          <p className="mt-2 text-sm text-gray-500">
            Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        )}
      </div>

      {showMap && (
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={position || [51.505, -0.09]}
            zoom={position ? 13 : 2}
            className="h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && (
              <Marker position={position} icon={icon} />
            )}
            <MapEvents onLocationSelect={handleMapClick} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}