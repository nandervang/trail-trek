import { Package2 } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import { formatWeight } from '@/utils/weight';
import { GearItem } from './types';
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Update the import path for the Supabase client
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

interface GearListProps {
  items: GearItem[];
  onToggleChecked: (id: string, checked: boolean) => void;
  onRemoveGear: (id: string) => void;
  viewOnly?: boolean;
  hikeId: string;
  onToggleWearable?: (id: string, isWorn: boolean) => void; // Add prop
}

export default function GearList({ 
  items, 
  onToggleChecked, 
  onRemoveGear, 
  viewOnly = false,
  hikeId,
  onToggleWearable, // Add prop
}: GearListProps) {
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Ensure items is always an array
  const safeItems = items || [];
  
  // Adapt items to a consistent structure
  const adaptedItems = safeItems.map(item => {
    // If the item already has gear property, use it
    const gear = item.gear || item;
    
    // Otherwise, create a structure where gear holds the item properties
    return {
      id: item.id,
      checked: item.checked || false,
      quantity: item.quantity || 1,
      notes: item.notes,
      location: item.location, // Keep the original location if it exists
      // Create a gear object from the item itself
      gear: {
        id: gear.id,
        name: gear.name,
        weight_kg: gear.weight_kg,
        image_url: gear.image_url,
        location: gear.location,
        category: gear.category,
        description: gear.description, 
      }
    };
  });
  
  // Group by category
  const groupedGear = adaptedItems.reduce((acc, item) => {
    const categoryName = item.gear?.category?.name || 'Uncategorized';
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Sort grouped gear alphabetically by category name
  const sortedGroupedGear = Object.keys(groupedGear)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sortedAcc, key) => {
      sortedAcc[key] = groupedGear[key];
      return sortedAcc;
    }, {} as Record<string, any[]>);
  
  // If no items were grouped, show a message
  if (Object.keys(sortedGroupedGear).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No gear items found. The data may not match the expected format.
      </div>
    );
  }

  // Update the handleRemoveGear function to ensure it takes in gearId and removes the gear item from the correct hike using hikeId
  const handleRemoveGear = async (gearId: string) => {
    setRemovingItemId(gearId);

    console.log(`Removing gear with ID: ${gearId} from hike with ID: ${hikeId}`);
    // Wait for the fade-out animation to complete
    setTimeout(async () => {
      try {

        const { error } = await supabase
          .from('hike_gear')
          .delete()
          .eq('gear_id', gearId) // Use 'gear_id' instead of 'id'
          .eq('hike_id', hikeId);

        if (error) {
          console.error('Failed to remove gear assignment from hike:', error);
          toast.error(`Failed to remove gear assignment: ${error.message}`);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['hike-gear', hikeId] }); // Remove gearId from queryKey
        onRemoveGear(gearId);
      } catch (error) {
        console.error('Unexpected error while removing gear assignment:', error);
      } finally {
        setRemovingItemId(null);
      }
    }, 300); // Match the CSS animation duration
  };

  return (
    <div className="space-y-4">
      {Object.entries(sortedGroupedGear).map(([category, categoryItems]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">{category}</h3>
          </div>
          <div className="p-4">
            {categoryItems.map((item) => {
              if (!item || !item.gear) return null;
              const isRemoving = removingItemId === item.id;
              const location = item.location || 
                               item.gear.location || 
                               (item.gear.category && item.gear.category.name === 'Storage' ? 'Storage location' : null);
              return (
                <div
                  key={item.id}
                  className={`flex items-center py-2 group transition-opacity duration-300 ${
                    isRemoving ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div 
                    className={`h-6 w-6 border border-gray-300 mr-4 ${!viewOnly && 'cursor-pointer'} relative ${
                      item.checked ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => !viewOnly && onToggleChecked(item.id, !item.checked)}
                  >
                    {item.checked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center flex-1">
                    {item.gear.image_url ? (
                      <Zoom>
                        <img
                          src={item.gear.image_url}
                          alt={item.gear.name || 'Gear image'}
                          className="w-12 h-12 object-cover rounded mr-4"
                        />
                      </Zoom>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-4">
                        <Package2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={item.checked ? 'line-through text-gray-500' : ''}>
                          {item.gear.name}
                          {item.quantity > 1 && (
                            <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                          )}
                        </span>
                        {/* Add delete button/icon on hover */}
                        {!viewOnly && (
                          <button
                            className="hidden group-hover:block text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveGear(item.gear.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="text-sm text-gray-500">
                          {formatWeight((item.gear.weight_kg || 0) * (item.quantity || 1))}
                        </div>
                        {/* Wearable checkbox for all items */}
                        {!viewOnly && typeof item.is_worn !== 'undefined' && onToggleWearable && (
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_worn}
                              onChange={() => onToggleWearable(item.id, !item.is_worn)}
                            />
                            <span>Wearable</span>
                          </label>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.gear.description && (
                          <p className="text-sm text-gray-500">{item.gear.description}</p>
                        )}
                        {location && (
                          <span className="ml-2">📍 {location}</span>
                        )}
                        {item.notes && (
                          <span className="ml-2">📝 {item.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}