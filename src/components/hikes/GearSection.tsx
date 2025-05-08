import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatWeight } from '@/utils/weight';
import Zoom from 'react-medium-image-zoom';
import { Package2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GearSectionProps {
  gear: any[];
  hikeId: string;
  expanded: boolean;
  onToggle: () => void;
  title: string;
  isWearable?: boolean;
  viewOnly?: boolean;
}

export default function GearSection({ 
  gear, 
  hikeId, 
  expanded, 
  onToggle, 
  title, 
  isWearable, 
  viewOnly = false 
}: GearSectionProps) {
  const queryClient = useQueryClient();
  const [showGearSelector, setShowGearSelector] = useState(false);
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const { data: availableGear } = useQuery({
    queryKey: ['available-gear', isWearable],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gear_items')
        .select(`
          id,
          name,
          weight_kg,
          image_url,
          category:categories(id, name)
        `)
        .eq('is_worn', isWearable || false);
        
      if (error) throw error;
      return data;
    },
    enabled: !viewOnly,
  });

  const toggleGearChecked = useMutation({
    mutationFn: async (variables: { gearId: string; checked: boolean }) => {
      const { data, error } = await supabase
        .from('hike_gear')
        .update({ checked: variables.checked })
        .eq('id', variables.gearId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-gear', hikeId] });
    },
  });

  const addGearToHike = useMutation({
    mutationFn: async () => {
      if (!selectedGearId) throw new Error('No gear selected');
      
      const { data, error } = await supabase
        .from('hike_gear')
        .insert([{
          hike_id: hikeId,
          gear_id: selectedGearId,
          quantity,
          notes,
          is_worn: isWearable || false,
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-gear', hikeId] });
      setShowGearSelector(false);
      setSelectedGearId(null);
      setQuantity(1);
      setNotes('');
      toast.success('Gear added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add gear: ${error.message}`);
    },
  });

  const groupedGear = gear.reduce((acc, item) => {
    const categoryName = (item.gear as any)?.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const totalWeight = gear.reduce((sum, item) => {
    return sum + ((item.gear?.weight_kg || 0) * (item.quantity || 1));
  }, 0);

  return (
    <div className="card print:shadow-none print:border-black">
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-6 gap-2 sm:gap-0"
        onClick={onToggle}
      >
        <div className="flex items-center cursor-pointer">
          <h2 className="text-xl sm:text-2xl font-light">{title}</h2>
          <span className="ml-2 text-sm text-gray-500">
            {gear.length} items • {formatWeight(totalWeight)}
          </span>
        </div>
        <div className="flex items-center ml-auto">
          {!viewOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGearSelector(true);
              }}
              className="btn btn-outline text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 flex items-center mr-2"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">Add Gear</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}
          <button 
            className="print:hidden"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 print:border-black p-3 sm:p-6">
          {showGearSelector && !viewOnly && (
            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div>
                <label className="label">Select Gear</label>
                <select
                  title='Select gear item'
                  value={selectedGearId || ''}
                  onChange={(e) => setSelectedGearId(e.target.value)}
                  className="input text-sm sm:text-base h-10 sm:h-auto"
                >
                  <option value="">Choose gear item...</option>
                  {availableGear?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatWeight(item.weight_kg)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="label text-xs">Quantity</label>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input text-sm h-10"
                  />
                </div>
                <div>
                  <label className="label text-xs">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="input text-sm h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGearSelector(false)}
                  className="btn btn-outline text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => addGearToHike.mutate()}
                  disabled={!selectedGearId}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  Add to Hike
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-8">
            {Object.entries(groupedGear).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg sm:text-xl font-light mb-2 sm:mb-4">{category}</h3>
                
                {/* Mobile view */}
                <div className="space-y-2 sm:hidden">
                  {/* @ts-ignore - Suppressing TypeScript error for now */}
                  {items.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-lg p-2 flex">
                      <div 
                        className={`h-5 w-5 border border-gray-300 print:border-black mt-1 mr-2 cursor-pointer relative flex-shrink-0 ${
                          item.checked ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => !viewOnly && toggleGearChecked.mutate({ 
                          gearId: item.id, 
                          checked: !item.checked 
                        })}
                      >
                        {item.checked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-base ${item.checked ? 'line-through decoration-[#558455] decoration-wavy decoration-1' : ''}`}>
                          {(item.gear as any).name}
                          {item.quantity > 1 && (
                            <span className="ml-1 text-gray-600">({item.quantity}x)</span>
                          )}
                        </div>
                        <div className="flex mt-1 flex-wrap gap-1">
                          <span className="text-xs text-gray-500 bg-gray-100 rounded px-1 py-0.5">
                            {formatWeight((item.gear as any).weight_kg * item.quantity)}
                          </span>
                          {item.notes && (
                            <span className="text-xs text-gray-500 bg-gray-100 rounded px-1 py-0.5">
                              {item.notes}
                            </span>
                          )}
                          {(item.gear as any).location && (
                            <span className="text-xs text-gray-500 bg-gray-100 rounded px-1 py-0.5">
                              📍 {(item.gear as any).location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop view */}
                <div className="space-y-4 hidden sm:block">
                  {/* @ts-ignore - Suppressing TypeScript error for now */}
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center text-base sm:text-lg">
                      <div 
                        className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                          item.checked ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => !viewOnly && toggleGearChecked.mutate({ 
                          gearId: item.id, 
                          checked: !item.checked 
                        })}
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
                        <span className={item.checked ? 'line-through decoration-[#558455] decoration-wavy decoration-2' : ''}>
                          {(item.gear as any).name}
                          {item.quantity > 1 && (
                            <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                          )}
                          <span className="ml-2 text-gray-500">
                            {formatWeight((item.gear as any).weight_kg * item.quantity)}
                          </span>
                          {item.notes && (
                            <span className="ml-2 text-gray-500 text-base">
                              - {item.notes}
                            </span>
                          )}
                          {(item.gear as any).location && (
                            <span className="ml-2 text-gray-500 text-base">
                              📍 {(item.gear as any).location}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}