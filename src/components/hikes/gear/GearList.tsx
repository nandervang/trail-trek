import { Package2 } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import { formatWeight } from '@/utils/weight';
import { GearItem } from './types';

interface GearListProps {
  items: GearItem[];
  onToggleChecked: (id: string, checked: boolean) => void;
  viewOnly?: boolean;
}

export default function GearList({ 
  items, 
  onToggleChecked, 
  viewOnly = false,
}: GearListProps) {
  // Debug the first item to see its structure
  if (items?.length > 0) {
    console.log('First item structure:', JSON.stringify(items[0], null, 2));
  }

  // Ensure items is always an array
  const safeItems = items || [];
  
  // Adapt items to a consistent structure
  const adaptedItems = safeItems.map(item => {
    // If the item already has gear property, use it
    if (item.gear) return item;
    
    // Otherwise, create a structure where gear holds the item properties
    return {
      id: item.id,
      checked: item.checked || false,
      quantity: item.quantity || 1,
      notes: item.notes,
      location: item.location, // Keep the original location if it exists
      // Create a gear object from the item itself
      gear: {
        name: item.name,
        weight_kg: item.weight_kg,
        image_url: item.image_url,
        location: item.location, // Copy location to gear as well
        category: item.category,
        description: item.description,
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
  
  // If no items were grouped, show a message
  if (Object.keys(groupedGear).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No gear items found. The data may not match the expected format.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedGear).map(([category, categoryItems]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">{category}</h3>
          </div>
          <div className="p-4">
            {categoryItems.map((item) => {
              if (!item || !item.gear) return null;
              
              // Check for location in all possible places
              const location = item.location || 
                               item.gear.location || 
                               (item.gear.category && item.gear.category.name === 'Storage' ? 'Storage location' : null);
              
              // Debug the location for this item
              console.log(`Item "${item.gear.name}" location:`, location);
              
              return (
                <div key={item.id} className="flex items-center py-2">
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
                      <div className="flex justify-between">
                        <span className={item.checked ? 'line-through text-gray-500' : ''}>
                          {item.gear.name}
                          {item.quantity > 1 && (
                            <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                          )}
                        </span>
                        
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatWeight((item.gear.weight_kg || 0) * (item.quantity || 1))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
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