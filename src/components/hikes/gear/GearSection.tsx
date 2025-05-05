import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Package, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import GearList from './GearList';
import GearSelector from './GearSelector';
import { GearItem } from './types';

interface GearSectionProps {
  gear: GearItem[] | any[];
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

  const toggleGearChecked = useMutation({
    mutationFn: async ({ gearId, checked }: { gearId: string; checked: boolean }) => {
      const { data, error } = await supabase
        .from('hike_gear')
        .update({ checked })
        .eq('id', gearId)
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
    mutationFn: async ({ gearId, quantity, notes }: { gearId: string; quantity: number; notes: string }) => {
      const { data, error } = await supabase
        .from('hike_gear')
        .insert([{
          hike_id: hikeId,
          gear_id: gearId,
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
      toast.success('Gear added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add gear: ${error.message}`);
    },
  });

  const handleAddGear = (gearId: string, quantity: number, notes: string) => {
    addGearToHike.mutate({ gearId, quantity, notes });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-xl font-light flex items-center">
          <Package className="h-6 w-6 mr-3 text-primary-600" />
          {title}
        </h2>
        <div className="flex items-center space-x-4">
          {!viewOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGearSelector(true);
              }}
              className="btn btn-outline flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          )}
          {expanded ? (
            <ChevronUp className="h-6 w-6 text-gray-400" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          {!viewOnly && showGearSelector && (
            <GearSelector
              isWearable={isWearable}
              onSelect={handleAddGear}
              onCancel={() => setShowGearSelector(false)}
            />
          )}

          <GearList
            items={gear}
            onToggleChecked={(gearId, checked) => toggleGearChecked.mutate({ gearId, checked })}
            viewOnly={false}
          />
        </div>
      )}
    </div>
  );
}
