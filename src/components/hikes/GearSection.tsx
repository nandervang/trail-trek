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
}

export default function GearSection({ gear, hikeId, expanded, onToggle, title, isWearable }: GearSectionProps) {
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

  return (
    <div className="card print:shadow-none print:border-black">
      <div 
        className="flex justify-between items-center p-6"
      >
        <h2 className="text-2xl font-light">{title}</h2>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setShowGearSelector(true)}
            className="btn btn-outline flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Gear
          </button>
          <button 
            className="print:hidden"
            onClick={onToggle}
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
        <div className="border-t border-gray-100 print:border-black p-6">
          {showGearSelector && (
            <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="label">Select Gear</label>
                <select
                  title='Select gear item'
                  value={selectedGearId || ''}
                  onChange={(e) => setSelectedGearId(e.target.value)}
                  className="input"
                >
                  <option value="">Choose gear item...</option>
                  {availableGear?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatWeight(item.weight_kg)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity</label>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGearSelector(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => addGearToHike.mutate()}
                  disabled={!selectedGearId}
                  className="btn btn-primary"
                >
                  Add to Hike
                </button>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {Object.entries(groupedGear).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xl font-light mb-4">{category}</h3>
                <div className="space-y-4">
                  {/* @ts-ignore - Suppressing TypeScript error for now */}
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center text-lg">
                      <div 
                        className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                          item.checked ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => toggleGearChecked.mutate({ 
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