import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { CalendarCheck, MapPin, Package2, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatWeight } from '@/utils/weight';

type Hike = Database['public']['Tables']['hikes']['Row'];
type GearItem = Database['public']['Tables']['gear_items']['Row'];

export default function Dashboard() {
  const { user } = useAuth();
  const [totalWeight, setTotalWeight] = useState(0);
  
  const { data: upcomingHikes, isLoading: isLoadingHikes } = useQuery({
    queryKey: ['upcoming-hikes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('user_id', user?.id ?? '')
        .eq('status', 'planned' as string)
        .order('start_date', { ascending: true })
        .limit(3);
        
      if (error) throw error;
      return data as Hike[];
    },
    enabled: !!user,
  });
  
  const { data: recentHikes } = useQuery({
    queryKey: ['recent-hikes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('user_id', user?.id ?? '')
        .eq('status', 'completed' as string)
        .order('end_date', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      return data as Hike[];
    },
    enabled: !!user,
  });
  
  const { data: gearItems, isLoading: isLoadingGear } = useQuery({
    queryKey: ['gear-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gear_items')
        .select('*')
        .eq('user_id', user?.id ?? '');
        
      if (error) throw error;
      return data as GearItem[];
    },
    enabled: !!user,
  });
  
  const { data: categoryStats } = useQuery({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, gear_items(id)')
        .eq('user_id', user?.id ?? '');
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (gearItems) {
      const total = gearItems.reduce((sum, item) => sum + (item.weight_kg || 0) * (item.quantity || 1), 0);
      setTotalWeight(total);
    }
  }, [gearItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Dashboard
      </motion.h1>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Upcoming Hikes</h3>
            <CalendarCheck className="h-6 w-6 text-primary-500" />
          </div>
          <div className="text-3xl font-bold">{upcomingHikes?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Planned trips</div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Completed Hikes</h3>
            <MapPin className="h-6 w-6 text-secondary-500" />
          </div>
          <div className="text-3xl font-bold">{recentHikes?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Previous adventures</div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Gear Items</h3>
            <Package2 className="h-6 w-6 text-accent-600" />
          </div>
          <div className="text-3xl font-bold">{gearItems?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Items in inventory</div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Total Gear Weight</h3>
            <PieChart className="h-6 w-6 text-success-500" />
          </div>
          <div className="text-3xl font-bold">{formatWeight(totalWeight)}</div>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Upcoming Hikes</h2>
            <Link to="/hikes" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {isLoadingHikes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : upcomingHikes && upcomingHikes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingHikes.map((hike) => (
                <li key={hike.id} className="py-4">
                  <Link to={`/hikes/${hike.id}`} className="block hover:bg-gray-50 -mx-6 px-6 py-2 transition-colors">
                    <h3 className="font-medium text-gray-900">{hike.name}</h3>
                    <div className="mt-1 flex justify-between">
                      <div className="text-sm text-gray-500">
                        {hike.start_date ? new Date(hike.start_date).toLocaleDateString() : 'No date set'}
                        {hike.end_date ? ` - ${new Date(hike.end_date).toLocaleDateString()}` : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {hike.distance_km ? `${hike.distance_km} kilometers` : 'Distance not set'}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming hikes planned.</p>
              <Link to="/hikes/new" className="mt-4 inline-block btn btn-primary">
                Plan a new hike
              </Link>
            </div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gear Inventory</h2>
            <Link to="/gear" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          
          {isLoadingGear ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : gearItems && categoryStats ? (
            <div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Total Items</div>
                  <div className="text-2xl font-semibold">{gearItems.length}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Categories</div>
                  <div className="text-2xl font-semibold">{categoryStats.length}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Top Categories</h3>
                {categoryStats.slice(0, 4).map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{category.name}</span>
                    <span className="text-sm font-medium">{category.gear_items.length} items</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link to="/gear/new" className="btn btn-outline">
                  Add new gear
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No gear items added yet.</p>
              <Link to="/gear/new" className="mt-4 inline-block btn btn-primary">
                Add your first item
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}