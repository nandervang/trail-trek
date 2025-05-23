import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Package2, Utensils, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatWeight } from '@/utils/weight';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import GearDetailsModal from '@/components/gear/GearDetailsModal';

type GearItem = {
  id: string;
  name: string;
  weight_kg: number;
  category: {
    id: string;
    name: string;
  };
  quantity: number;
  is_worn: boolean;
  description: string | null;
  image_url: string | null;
  location: string | null;
  notes: string | null;
  purpose: string | null;
  volume: string | null;
  sizes: string | null;
};

type FoodItem = {
  id: string;
  name: string;
  weight_kg: number;
  calories: number;
  meal_category: string;
  quantity: number;
  description: string | null;
};

type GroupedGear = {
  [key: string]: {
    items: GearItem[];
    totalWeight: number;
    itemCount: number;
    wornCount: number;
  };
};

export default function GearList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [groupedGear, setGroupedGear] = useState<GroupedGear>({}); // Converted groupedGear to state

  const { data: gearWithCategories, isLoading: isLoadingGear, refetch: refetchGearWithCategories } = useQuery({
    queryKey: ['gear', searchQuery],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      let query = supabase
        .from('gear_items')
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq('user_id', user.id);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GearItem[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (gearWithCategories) {
      const grouped = gearWithCategories.reduce((acc: GroupedGear, item) => {
        const categoryName = item.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            items: [],
            totalWeight: 0,
            itemCount: 0,
            wornCount: 0,
          };
        }

        acc[categoryName].items.push(item);
        acc[categoryName].totalWeight += item.weight_kg * item.quantity;
        acc[categoryName].itemCount += item.quantity;
        if (item.is_worn) {
          acc[categoryName].wornCount++;
        }

        return acc;
      }, {});

      // Sort grouped gear alphabetically by category name
      const sortedGrouped = Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .reduce((sortedAcc, key) => {
          sortedAcc[key] = grouped[key];
          return sortedAcc;
        }, {} as GroupedGear);

      setGroupedGear(sortedGrouped);
    }
  }, [gearWithCategories]);

  const { data: foodItems, isLoading: isLoadingFood } = useQuery({
    queryKey: ['food', searchQuery],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      let query = supabase
        .from('hike_food')
        .select('*')
        .eq('user_id', user.id);
        
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FoodItem[];
    },
    enabled: !!user,
  });

  const totalStats = gearWithCategories?.reduce((acc, item) => {
    acc.totalWeight += item.weight_kg * item.quantity;
    acc.totalItems += item.quantity;
    if (item.is_worn) {
      acc.wornWeight += item.weight_kg * item.quantity;
      acc.wornItems++;
    } else {
      acc.baseWeight += item.weight_kg * item.quantity;
    }
    return acc;
  }, {
    totalWeight: 0,
    totalItems: 0,
    baseWeight: 0,
    wornWeight: 0,
    wornItems: 0
  });

  const foodStats = foodItems?.reduce((acc, item) => {
    acc.totalWeight += item.weight_kg * item.quantity;
    acc.totalItems += item.quantity;
    acc.totalCalories += (item.calories || 0) * item.quantity;
    return acc;
  }, {
    totalWeight: 0,
    totalItems: 0,
    totalCalories: 0
  });
  
  const handleCategoryNameChange = async (oldCategoryName: string, newCategoryName: string) => {
    if (oldCategoryName === newCategoryName || !newCategoryName.trim()) return;

    // Optimistically update the UI
    const updatedGroupedGear = { ...groupedGear };
    updatedGroupedGear[newCategoryName] = updatedGroupedGear[oldCategoryName];
    delete updatedGroupedGear[oldCategoryName];
    setGroupedGear(updatedGroupedGear);

    const { error } = await supabase
      .from('categories')
      .update({ name: newCategoryName })
      .eq('name', oldCategoryName);

    if (error) {
      console.error('Error updating category name:', error.message);
      return;
    }

    // Refetch the data to ensure consistency
    refetchGearWithCategories();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gear Inventory</h1>
        <Link to="/gear/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" /> Add New Item
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search gear..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-0 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {(isLoadingGear || isLoadingFood) ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-900"></div>
          </div>
        ) : (gearWithCategories && gearWithCategories.length > 0) || (foodItems && foodItems.length > 0) ? (
          <div className="space-y-12">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-light mb-2">Base Weight</h3>
                <p className="text-2xl font-light">{formatWeight(totalStats?.baseWeight || 0)}</p>
                <p className="text-sm text-gray-500 mt-2">Excluding worn items</p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-light mb-2">Worn Weight</h3>
                <p className="text-2xl font-light">{formatWeight(totalStats?.wornWeight || 0)}</p>
                <p className="text-sm text-gray-500 mt-2">{totalStats?.wornItems || 0} worn items</p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-light mb-2">Total Weight</h3>
                <p className="text-2xl font-light">{formatWeight(totalStats?.totalWeight || 0)}</p>
                <p className="text-sm text-gray-500 mt-2">{totalStats?.totalItems || 0} total items</p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-light mb-2">Categories</h3>
                <p className="text-2xl font-light">{Object.keys(groupedGear || {}).length}</p>
                <p className="text-sm text-gray-500 mt-2">Gear categories</p>
              </div>
            </div>

            {/* Gear by Category */}
            {Object.entries(groupedGear || {}).map(([category, data]) => (
              <div key={category} className="card overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      <input
                        type="text"
                        defaultValue={category} // Use defaultValue to make the input editable
                        onBlur={(e) => handleCategoryNameChange(category, e.target.value)} // Update on blur
                        className="bg-transparent focus:outline-none focus:border-primary-500"
                      />
                    </h3>
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
                        <th className="w-8 p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <tr key={item.id} className="group hover:bg-gray-50">
                          <td className="p-4">
                            {item.image_url ? (
                              <Zoom>
                                <img
                                  src={item.image_url}
                                  alt={item.name}
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
                              <span className="text-gray-900">{item.name}</span>
                              {(item.description || item.location || item.notes) && (
                                <div className="mt-1 space-y-1">
                                  {item.description && (
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                  )}
                                  {item.location && (
                                    <p className="text-sm text-gray-500">
                                      📍 {item.location}
                                    </p>
                                  )}
                                  {item.notes && (
                                    <p className="text-sm text-gray-500">
                                      📝 {item.notes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{formatWeight(item.weight_kg)}</td>
                          <td className="p-4 text-gray-600">{item.quantity}</td>
                          <td className="p-4 text-gray-600">{formatWeight(item.weight_kg * item.quantity)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.is_worn 
                                ? 'bg-secondary-100 text-secondary-800' 
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {item.is_worn ? 'Worn' : 'Carried'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setSelectedGear(item)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                              <Link 
                                to={`/gear/${item.id}`}
                                className="text-sm text-primary-900 hover:text-primary-800"
                              >
                                Edit
                              </Link>
                            </div>
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
                        <td colSpan={2} className="p-4 text-sm text-gray-500">
                          {data.wornCount > 0 && `${data.wornCount} worn items`}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}

            {/* Food Items */}
            {foodItems && foodItems.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-light flex items-center">
                      <Utensils className="h-6 w-6 mr-2 text-primary-600" />
                      Food
                    </h2>
                    <div className="text-sm text-gray-500">
                      {foodStats?.totalItems} items • {formatWeight(foodStats?.totalWeight || 0)} • {foodStats?.totalCalories || 0} calories
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Item</th>
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Category</th>
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Weight</th>
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Calories</th>
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Quantity</th>
                        <th className="text-left text-sm font-light uppercase tracking-wider text-gray-600 p-4">Total Weight</th>
                        <th className="w-8 p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodItems.map((item) => (
                        <tr key={item.id} className="group hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <span className="text-gray-900">{item.name}</span>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{item.meal_category}</td>
                          <td className="p-4 text-gray-600">{formatWeight(item.weight_kg)}</td>
                          <td className="p-4 text-gray-600">{item.calories || '-'}</td>
                          <td className="p-4 text-gray-600">{item.quantity}</td>
                          <td className="p-4 text-gray-600">{formatWeight(item.weight_kg * item.quantity)}</td>
                          <td className="p-4">
                            <Link 
                              to={`/food/${item.id}`}
                              className="text-sm text-primary-900 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={5} className="p-4 text-sm font-medium text-gray-700">
                          Food Total
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-700">
                          {formatWeight(foodStats?.totalWeight || 0)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "No items found matching your search"
                : "Your gear inventory is empty"}
            </p>
            <Link to="/gear/new" className="btn btn-primary">
              Add Your First Item
            </Link>
          </div>
        )}
      </motion.div>

      {selectedGear && (
        <GearDetailsModal
          isOpen={!!selectedGear}
          onClose={() => setSelectedGear(null)}
          gear={selectedGear}
        />
      )}
    </div>
  );
}