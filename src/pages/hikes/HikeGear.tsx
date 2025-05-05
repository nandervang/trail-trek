import { Package2 } from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatWeight } from '@/utils/weight';

interface HikeGearProps {
  hikeId: string;
}

function HikeGear({ hikeId }: HikeGearProps) {
  const { data: gearItems, isLoading } = useQuery({
    queryKey: ['hikeGear', hikeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hike_gear')
        .select(`
          *,
          gear:gear_items(
            id,
            name,
            description,
            weight_kg,
            image_url,
            category:categories(
              name
            )
          )
        `)
        .eq('hike_id', hikeId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!gearItems?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No gear items added yet.
      </div>
    );
  }

  // Group gear by category
  const groupedGear = gearItems.reduce((acc, item) => {
    const categoryName = item.gear?.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        items: [],
        totalWeight: 0,
        itemCount: 0,
        wornCount: 0
      };
    }
    
    const itemWeight = (item.gear?.weight_kg || 0) * (item.quantity || 1);
    acc[categoryName].items.push(item);
    acc[categoryName].totalWeight += itemWeight;
    acc[categoryName].itemCount += item.quantity || 1;
    if (item.is_worn) {
      acc[categoryName].wornCount++;
    }
    
    return acc;
  }, {} as Record<string, { 
    items: typeof gearItems; 
    totalWeight: number;
    itemCount: number;
    wornCount: number;
  }>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedGear).map(([category, data]) => (
        <div key={category} className="card overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light">{category}</h2>
              <div className="text-sm text-gray-500">
                {data.itemCount} items • {formatWeight(data.totalWeight)}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4 w-16"></th>
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Item</th>
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Weight</th>
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Quantity</th>
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Total</th>
                  <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Type</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50">
                    <td className="p-4">
                      {item.gear?.image_url ? (
                        <Zoom>
                          <img
                            src={item.gear.image_url}
                            alt={item.gear?.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </Zoom>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Package2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-gray-900">{item.gear?.name}</span>
                        {item.gear?.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.gear.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{formatWeight(item.gear?.weight_kg || 0)}</td>
                    <td className="p-4 text-gray-600">{item.quantity || 1}</td>
                    <td className="p-4 text-gray-600">
                      {formatWeight((item.gear?.weight_kg || 0) * (item.quantity || 1))}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_worn 
                          ? 'bg-secondary-100 text-secondary-800' 
                          : 'bg-primary-100 text-primary-800'
                      }`}>
                        {item.is_worn ? 'Worn' : 'Carried'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <td colSpan={4} className="p-4 text-sm font-medium text-gray-700">
                    Category Total
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">
                    {formatWeight(data.totalWeight)}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {data.wornCount > 0 && `${data.wornCount} worn items`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HikeGear;