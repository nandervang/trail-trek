import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import HikeOverview from '@/components/hikes/HikeOverview';
import TaskSection from '@/components/hikes/tasks/TaskSection';
import GearSection from '@/components/hikes/gear/GearSection';

export default function SharedPlanner() {
  const { shareId } = useParams<{ shareId: string }>();
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

  const { data: hike, isLoading: isLoadingHike } = useQuery({
    queryKey: ['shared-hike', shareId],
    queryFn: async () => {
      if (!shareId) throw new Error("Invalid request");
      
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('share_id', shareId)
        .eq('share_enabled', true)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!shareId,
  });

  const { data: tasks } = useQuery({
    queryKey: ['shared-hike-tasks', shareId],
    queryFn: async () => {
      if (!shareId || !hike?.id) throw new Error("Invalid request");
      const { data, error } = await supabase
        .from('hike_tasks')
        .select('*')
        .eq('hike_id', hike.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!hike?.id,
  });

  const { data: gear } = useQuery({
    queryKey: ['shared-hike-gear', shareId],
    queryFn: async () => {
      if (!shareId || !hike?.id) throw new Error("Invalid request");
      const { data, error } = await supabase
        .from('hike_gear')
        .select(`
          *,
          gear:gear_items(
            id,
            name,
            weight_kg,
            image_url,
            category:categories(id, name)
          )
        `)
        .eq('hike_id', hike.id);
      if (error) throw error;
      return data;
    },
    enabled: !!hike?.id,
  });

  if (isLoadingHike) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hike) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hike Not Found</h1>
        <p className="text-gray-600 mb-8">
          This hike may have expired or been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const { baseWeight, totalWeight, wearableWeight, bigThreeWeight } = gear?.reduce((acc, item) => {
    const weight = (item.gear?.weight_kg || 0) * (item.quantity || 1);
    const category = item.gear?.category?.name || '';
    
    if (item.is_worn) {
      acc.wearableWeight += weight;
    } else {
      acc.baseWeight += weight;
      
      if (
        category === 'Shelter' || 
        category === 'Backpack' || 
        category === 'Sleep System'
      ) {
        acc.bigThreeWeight += weight;
      }
    }
    acc.totalWeight += weight;
    return acc;
  }, { baseWeight: 0, wearableWeight: 0, totalWeight: 0, bigThreeWeight: 0 }) ?? 
  { baseWeight: 0, wearableWeight: 0, totalWeight: 0, bigThreeWeight: 0 };

  const regularGear = gear?.filter(item => !item.is_worn) || [];
  const wearableGear = gear?.filter(item => item.is_worn) || [];

  return (
    <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={`/shared/${shareId}`} className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-light">{hike.name} - Planner</h1>
        </div>
      </div>

      <div className="space-y-8">
        <HikeOverview 
          hike={hike}
          baseWeight={baseWeight}
          totalWeight={totalWeight}
          wearableWeight={wearableWeight}
          bigThreeWeight={bigThreeWeight}
          expanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        />

        <TaskSection
          tasks={tasks || []}
          hikeId={hike.id}
          expanded={expandedSections.tasks}
          onToggle={() => toggleSection('tasks')}
          viewOnly
        />

        <GearSection
          gear={regularGear}
          hikeId={hike.id}
          expanded={expandedSections.gear}
          onToggle={() => toggleSection('gear')}
          title="Gear List"
          viewOnly
        />

        {wearableGear.length > 0 && (
          <GearSection
            gear={wearableGear}
            hikeId={hike.id}
            expanded={expandedSections.gear}
            onToggle={() => toggleSection('gear')}
            title="Wearable Items"
            isWearable
            viewOnly
          />
        )}
      </div>
    </div>
  );
}