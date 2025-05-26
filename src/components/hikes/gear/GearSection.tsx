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
  onToggleWearable?: (id: string, isWorn: boolean) => void;
}

export default function GearSection({ 
  gear, 
  hikeId, 
  expanded, 
  onToggle, 
  title, 
  isWearable,
  viewOnly = false,
  onToggleWearable
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
    mutationFn: async ({ gearId, quantity, notes, is_worn }: { gearId: string; quantity: number; notes: string; is_worn: boolean }) => {
      const { data, error } = await supabase
        .from('hike_gear')
        .insert([{
          hike_id: hikeId,
          gear_id: gearId,
          quantity,
          notes,
          is_worn,
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

  const handleAddGear = (gearId: string, quantity: number, notes: string, is_worn: boolean) => {
    addGearToHike.mutate({ gearId, quantity, notes, is_worn });
  };

  const handleRemoveGear = async (gearId: string) => {
    console.log(`Removing gear with ID: ${gearId} from hike with ID: ${hikeId}`);
    try {
      console.log('Attempting to delete gear with the following details:', {
        gearId,
        hikeId,
        userId: (await supabase.auth.getUser()).data?.user?.id, // Log the current user ID
      });

      const { error } = await supabase
        .from('hike_gear')
        .delete()
        .eq('id', gearId) // Use 'id' instead of 'gear_id'
        .eq('hike_id', hikeId);

      if (error) {
        console.error('Failed to remove gear:', error);
        toast.error(`Failed to remove gear: ${error.message}`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['hike-gear', hikeId, gearId] });
      toast.success('Gear removed successfully');
    } catch (error) {
      console.error('Unexpected error while removing gear:', error);
      toast.error('An unexpected error occurred while removing gear.');
    }
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
            onRemoveGear={handleRemoveGear}
            viewOnly={viewOnly}
            hikeId={hikeId}
            onToggleWearable={onToggleWearable} // Pass down
          />
        </div>
      )}
    </div>
  );
}
