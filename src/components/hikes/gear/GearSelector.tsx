import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatWeight } from '@/utils/weight';
import { GearItem } from './types';

interface GearSelectorProps {
  isWearable?: boolean;
  onSelect: (gearId: string, quantity: number, notes: string) => void;
  onCancel: () => void;
}

export default function GearSelector({ isWearable, onSelect, onCancel }: GearSelectorProps) {
  const [selectedGearId, setSelectedGearId] = useState<string>('');
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
      return data as GearItem[];
    },
  });

  const selectedGear = availableGear?.find(gear => gear.id === selectedGearId);

  const handleSubmit = () => {
    if (!selectedGearId) return;
    onSelect(selectedGearId, quantity, notes);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4 mb-6">
      <div>
        <label className="label">Select Gear</label>
        <select
          value={selectedGearId}
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
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedGearId}
          className="btn btn-primary"
        >
          Add to Hike
        </button>
      </div>
    </div>
  );
}