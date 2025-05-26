import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatWeight } from '@/utils/weight';
import { GearItem } from './types';

interface GearSelectorProps {
  isWearable?: boolean;
  onSelect: (gearId: string, quantity: number, notes: string, isWearable: boolean) => void;
  onCancel: () => void;
}

export default function GearSelector({ isWearable, onSelect, onCancel }: GearSelectorProps) {
  const [selectedGearId, setSelectedGearId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [wearable, setWearable] = useState(!!isWearable);

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
          quantity,
          category:categories(id, name)
        `)
        .or(isWearable 
          ? 'is_worn.eq.true,category_id.eq.904455e4-4e83-4ca7-beca-9205273b8cfe' 
          : 'is_worn.eq.false');
  
      if (error) throw error;
      return data as GearItem[];
    },
  });

  // Filter and group gear by category
  const filteredGear = useMemo(() => {
    if (!availableGear) return [];
    return availableGear.filter(item =>
      (item.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [availableGear, search]);

  const groupedGear = useMemo(() => {
    const groups: Record<string, GearItem[]> = {};
    filteredGear.forEach(item => {
      const cat = item.category?.name || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredGear]);

  const handleSubmit = () => {
    if (!selectedGearId) return;
    onSelect(selectedGearId, quantity, notes, wearable);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4 mb-6">
      <div>
        <label className="label">Search Gear</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search gear..."
          className="input mb-2"
        />
        <label className="label">Select Gear</label>
        <select
          name="gear"
          title='Select gear item'
          value={selectedGearId}
          onChange={(e) => setSelectedGearId(e.target.value)}
          className="input"
        >
          <option value="">Choose gear item...</option>
          {Object.entries(groupedGear).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({formatWeight(item.weight_kg || 0)})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Quantity</label>
          <input
            type="number"
            aria-label='Quantity'
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
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={wearable}
              onChange={e => setWearable(e.target.checked)}
            />
            <span>Wearable</span>
          </label>
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