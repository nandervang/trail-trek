import { Package2 } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import { formatWeight } from '@/utils/weight';
import { GearItem } from './types';

interface GearListProps {
  items: GearItem[];
  onToggleChecked: (id: string, checked: boolean) => void;
  viewOnly?: boolean;
}

export default function GearList({ items, onToggleChecked, viewOnly = false }: GearListProps) {
  console.log('items',items)
  const groupedGear = items.reduce((acc, item) => {
    const categoryName = item.gear?.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedGear).map(([category, categoryItems]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">{category}</h3>
          </div>
          <div className="p-4">
            {categoryItems.map((item) => (
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
                  {(item.gear as any).image_url ? (
                    <Zoom>
                      <img
                        src={(item.gear as any).image_url}
                        alt={(item.gear as any).name}
                        className="w-12 h-12 object-cover rounded mr-4"
                      />
                    </Zoom>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-4">
                      <Package2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <span className={item.checked ? 'line-through text-gray-500' : ''}>
                      {(item.gear as any).name}
                      {item.quantity > 1 && (
                        <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                      )}
                    </span>
                    <div className="text-sm text-gray-500">
                      {formatWeight((item.gear as any).weight_kg * item.quantity)}
                      {(item.gear as any).location && (
                        <span className="ml-2">📍 {(item.gear as any).location}</span>
                      )}
                      {item.notes && (
                        <span className="ml-2">📝 {item.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}