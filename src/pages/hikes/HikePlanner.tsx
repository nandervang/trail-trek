import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import HikeOverview from '@/components/hikes/HikeOverview';
import TaskSection from '@/components/hikes/tasks/TaskSection';
import GearSection from '@/components/hikes/gear/GearSection';

export default function HikePlanner() {
  const { id } = useParams<{ id: string }>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    tasks: true,
    gear: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { data: hike } = useQuery({
    queryKey: ['hike', id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid request");
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: tasks } = useQuery({
    queryKey: ['hike-tasks', id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid request");
      const { data, error } = await supabase
        .from('hike_tasks')
        .select('*')
        .eq('hike_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: gear } = useQuery({
    queryKey: ['hike-gear', id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid request");
      const { data, error } = await supabase
        .from('hike_gear')
        .select(`
          *,
          gear:gear_items(
            id,
            name,
            weight_kg,
            image_url,
            location,
            category:categories(id, name)
          )
        `)
        .eq('hike_id', id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (!hike || !id) return null;

  

  const { baseWeight, foodWeight, totalWeight, wearableWeight, bigThreeWeight } = gear?.reduce((acc, item) => {
    const weight = (item.gear?.weight_kg || 0) * (item.quantity || 1);
    const category = item.gear?.category?.name || '';
    
    if (item.is_worn) {
      acc.wearableWeight += weight;
    } else {
      acc.baseWeight += weight;
      
      // Calculate food weight
      if (
        category === 'Food'
      ) {
        acc.foodWeight += weight;
      }
      
      // Calculate big three weight (Shelter, Backpack, Sleep System)
      if (
        category === 'Shelter' || 
        category === 'Backpack' || 
        category === 'Sleep system'
      ) {
        acc.bigThreeWeight += weight;
      }
    }
    acc.totalWeight += weight;
    return acc;
  }, { baseWeight: 0, wearableWeight: 0, foodWeight: 0, totalWeight: 0, bigThreeWeight: 0 }) ?? 
  { baseWeight: 0, wearableWeight: 0, foodWeight: 0, totalWeight: 0, bigThreeWeight: 0 };


  const regularGear = gear?.filter(item => !item.is_worn) || [];
  const wearableGear = gear?.filter(item => item.is_worn) || [];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-16 lg:pb-8 max-w-4xl print:py-0 print:px-0">
      <div className="mb-4 sm:mb-8 flex items-center justify-between print:hidden">
        <div className="flex items-center">
          <Link to={`/hikes/${id}`} className="text-gray-500 hover:text-gray-700 mr-2 sm:mr-4">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <h1 className="text-xl sm:text-3xl font-light">Hike Planner</h1>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-primary text-sm py-1.5 px-3 sm:py-2 sm:px-4 flex items-center"
        >
          <Printer className="h-4 w-4 mr-1 hidden sm:inline" />
          Print
        </button>
      </div>

      <div className="space-y-4 sm:space-y-8">
        <HikeOverview 
          hike={hike}
          baseWeight={baseWeight}
          totalWeight={totalWeight}
          foodWeight={foodWeight}
          wearableWeight={wearableWeight}
          bigThreeWeight={bigThreeWeight}
          expanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        />

        <TaskSection
          tasks={tasks || []}
          hikeId={id}
          expanded={expandedSections.tasks}
          onToggle={() => toggleSection('tasks')}
          viewOnly={false}
        />

        <GearSection
          gear={regularGear}
          hikeId={id}
          expanded={expandedSections.gear}
          onToggle={() => toggleSection('gear')}
          title="Gear Checklist"
          viewOnly={false}
        />

        {wearableGear.length > 0 && (
          <GearSection
            gear={wearableGear}
            hikeId={id}
            expanded={expandedSections.gear}
            onToggle={() => toggleSection('gear')}
            title="Wearable Items"
            isWearable
            viewOnly={false}
          />
        )}
      </div>
    </div>
  );
}