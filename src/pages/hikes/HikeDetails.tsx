import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Edit, Menu, X, ListChecks, Package, Plus } from 'lucide-react';
import HikeOverview from '@/components/hikes/HikeOverview';
import TaskSection from '@/components/hikes/tasks/TaskSection';
import GearSection from '@/components/hikes/gear/GearSection';
import LogSection from '@/components/hikes/logs/LogSection';
import GallerySection from '@/components/hikes/gallery/GallerySection';
import { uploadImage } from '@/lib/storage';
import { toast } from 'sonner';
import LogModal from '@/components/LogModal';
import { Log } from '@/components/hikes/logs/types';

export default function HikeDetails() {
  const { id } = useParams<{ id: string }>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    gear: false,
    food: false,
    logs: false,
    tasks: false,
    completion: false,
    gallery: false,
  });
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: hike, isLoading } = useQuery({
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
            location,
            is_worn,
            image_url,
            category:categories(id, name)
          )
        `)
        .eq('hike_id', id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hike || !id) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAllSections = (expanded: boolean) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = expanded;
      });
      // Keep details section expanded
      newState.details = true;
      return newState;
    });
  };

  // const { baseWeight, totalWeight } = gear?.reduce((acc, item) => {
  //   const weight = (item.gear?.weight_kg || 0) * (item.quantity || 1);
  //   if (item.gear?.is_worn) {
  //     acc.wornWeight += weight;
  //   } else {
  //     acc.baseWeight += weight;
  //   }
  //   acc.totalWeight += weight;
  //   return acc;
  // }, { baseWeight: 0, wornWeight: 0, totalWeight: 0 }) ?? { baseWeight: 0, wornWeight: 0, totalWeight: 0 };



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



  const regularGear = gear?.filter(item => !(item.gear as any).is_worn) || [];
  const wearableGear = gear?.filter(item => (item.gear as any).is_worn) || [];

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => uploadImage(file, id));
      const imageUrls = await Promise.all(uploadPromises);
      
      const { error } = await supabase
        .from('hikes')
        .update({
          images: [...(hike.images || []), ...imageUrls]
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleImagesChange = async (newImages: string[], newDescriptions?: string[]) => {
    try {
      const { error } = await supabase
        .from('hikes')
        .update({
          images: newImages,
          image_descriptions: newDescriptions
        })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error('Failed to update images');
    }
  };

  const MobileQuickActions = () => (
    <div className="lg:hidden">
      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className="mobile-menu-item"
          onClick={() => toggleSection('tasks')}
        >
          <ListChecks className="h-6 w-6 mb-1" />
          Tasks
        </button>
        <button 
          className="mobile-menu-item"
          onClick={() => toggleSection('gear')}
        >
          <Package className="h-6 w-6 mb-1" />
          Gear
        </button>
        <Link 
          to={`/hikes/${id}/log`}
          className="mobile-menu-item"
        >
          <Plus className="h-6 w-6 mb-1" />
          Add Log
        </Link>
        <button 
          className="mobile-menu-item"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6 mb-1" />
          More
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Menu</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link 
                to={`/hikes/${id}/planner`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Planner
              </Link>
              <Link 
                to={`/hikes/${id}/edit`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Edit Hike
              </Link>
              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(v => v);
                  toggleAllSections(!allExpanded);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/hikes" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-light">{hike.name}</h1>
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={() => toggleAllSections(!Object.values(expandedSections).every(v => v))}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
          </button>
          <Link to={`/hikes/${id}/planner`} className="btn btn-outline">
            View Planner
          </Link>
          <Link to={`/hikes/${id}/edit`} className="btn btn-primary">
            <Edit className="h-4 w-4 mr-2" /> Edit Hike
          </Link>
        </div>
      </div>

      {/* Overview Section */}
      <HikeOverview 
        hike={hike}
        baseWeight={baseWeight}
        totalWeight={totalWeight}
        foodWeight={foodWeight}
        wearableWeight={wearableWeight}
        bigThreeWeight={bigThreeWeight}
        expanded={expandedSections.details}
        onToggle={() => toggleSection('details')}
      />

      {/* Tasks Section */}
      <TaskSection
        tasks={(tasks || []).map(task => ({
          ...task,
          completed: !!task.completed,
          created_at: task.created_at || ''
        }))}
        hikeId={id}
        expanded={expandedSections.tasks}
        onToggle={() => toggleSection('tasks')}
      />

      {/* Gear Section */}
      <GearSection
        gear={regularGear.map(item => ({
          id: item.id,
          name: item.gear?.name || '',
          weight_kg: item.gear?.weight_kg || 0,
          quantity: item.quantity || 1,
          category: item.gear?.category,
          checked: item.checked || false,
          location: item.gear.location || '',
          notes: item.notes || '',
          is_worn: item.gear?.is_worn || false,
          image_url: item.gear?.image_url || undefined
        }))}
        hikeId={id}
        expanded={expandedSections.gear}
        onToggle={() => toggleSection('gear')}
        title="Gear List"
      />

      <GearSection
        gear={wearableGear.map(item => ({
          id: item.id,
          name: item.gear?.name || '',
          weight_kg: item.gear?.weight_kg || 0,
          quantity: item.quantity || 1,
          category: item.gear?.category,
          checked: item.checked || false,
          location: item.gear.location || '',
          notes: item.notes || '',
          is_worn: item.gear?.is_worn || false,
          image_url: item.gear?.image_url || undefined
        }))}
        hikeId={id}
        expanded={expandedSections.wearable}
        onToggle={() => toggleSection('wearable')}
        title="Wearable Items"
        isWearable
      />

      {/* Logs Section */}
      <LogSection
        hikeId={id}
        expanded={expandedSections.logs}
        onToggle={() => toggleSection('logs')}
        onLogClick={setSelectedLog}
      />

      {/* Image Gallery Section */}
      <GallerySection
        images={hike.images || []}
        descriptions={hike.image_descriptions || []}
        expanded={expandedSections.gallery}
        onToggle={() => toggleSection('gallery')}
        onImagesChange={handleImagesChange}
        onUpload={handleImageUpload}
      />

      {/* Mobile Quick Actions */}
      <MobileQuickActions />

      {/* Log Modal */}
      <LogModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
        hikeId={id}
      />
    </div>
  );
}