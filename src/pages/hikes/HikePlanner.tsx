import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, MapPin, Route, Mountain, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { formatWeight } from '@/utils/weight';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

export default function HikePlanner() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
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

  const toggleTaskCompletion = useMutation({
    mutationFn: async (variables: { taskId: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('hike_tasks')
        .update({ completed: variables.completed })
        .eq('id', variables.taskId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-tasks', id] });
    },
  });

  const toggleGearChecked = useMutation({
    mutationFn: async (variables: { gearId: string; checked: boolean }) => {
      const { data, error } = await supabase
        .from('hike_gear')
        .update({ checked: variables.checked })
        .eq('id', variables.gearId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-gear', id] });
    },
  });

  if (!hike || !id) return null;

  // Calculate weight statistics
  const { baseWeight, totalWeight } = gear?.reduce((acc, item) => {
    const weight = (item.gear?.weight_kg || 0) * (item.quantity || 1);
    if (item.gear?.is_worn) {
      acc.wornWeight += weight;
    } else {
      acc.baseWeight += weight;
    }
    acc.totalWeight += weight;
    return acc;
  }, { baseWeight: 0, wornWeight: 0, totalWeight: 0 }) ?? { baseWeight: 0, wornWeight: 0, totalWeight: 0 };

  // Group gear by category
  const groupGearByCategory = (items: typeof gear) => {
    return items?.reduce((acc, item) => {
      const categoryName = (item.gear as any)?.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as Record<string, any[]>) || {};
  };

  const groupedRegularGear = groupGearByCategory(gear?.filter(item => !(item.gear as any).is_worn));
  const groupedWearableGear = groupGearByCategory(gear?.filter(item => (item.gear as any).is_worn));

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return format(parseISO(date), 'MMM d, yyyy');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl print:py-0 print:px-0">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div className="flex items-center">
          <Link to={`/hikes/${id}`} className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-light">Hike Planner</h1>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-primary"
        >
          Print Checklist
        </button>
      </div>

      {/* Summary Section */}
      <div className="card p-6 mb-8 print:shadow-none print:border-black">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('overview')}
        >
          <h2 className="text-2xl font-light">{hike.name}</h2>
          <button className="print:hidden">
            {expandedSections.overview ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {expandedSections.overview && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Dates</h4>
                  <p className="text-lg">
                    {hike.start_date && hike.end_date 
                      ? `${formatDate(hike.start_date)} - ${formatDate(hike.end_date)}`
                      : formatDate(hike.start_date)}
                  </p>
                </div>
              </div>

              {hike.distance_miles && (
                <div className="flex items-start">
                  <Route className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Distance</h4>
                    <p className="text-lg">{hike.distance_miles} miles</p>
                  </div>
                </div>
              )}

              {hike.elevation_gain && (
                <div className="flex items-start">
                  <Mountain className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Elevation Gain</h4>
                    <p className="text-lg">{hike.elevation_gain}m</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {hike.start_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting Point</h4>
                    <p className="text-lg">{hike.start_location}</p>
                  </div>
                </div>
              )}

              {hike.end_location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Destination</h4>
                    <p className="text-lg">{hike.end_location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Package className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Pack Weight</h4>
                  <p className="text-lg">
                    {formatWeight(baseWeight)} base • {formatWeight(totalWeight)} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Tasks Section */}
        {tasks && tasks.length > 0 && (
          <div className="card print:shadow-none print:border-black">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('tasks')}
            >
              <h2 className="text-2xl font-light">Preparation Tasks</h2>
              <button className="print:hidden">
                {expandedSections.tasks ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {expandedSections.tasks && (
              <div className="border-t border-gray-100 print:border-black p-6">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center text-lg">
                      <div 
                        className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                          task.completed ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => toggleTaskCompletion.mutate({ 
                          taskId: task.id, 
                          completed: !task.completed 
                        })}
                      >
                        {task.completed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={task.completed ? 'line-through decoration-[#558455] decoration-wavy decoration-2' : ''}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regular Gear Checklist */}
        {Object.keys(groupedRegularGear).length > 0 && (
          <div className="card print:shadow-none print:border-black">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('gear')}
            >
              <h2 className="text-2xl font-light">Gear Checklist</h2>
              <button className="print:hidden">
                {expandedSections.gear ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {expandedSections.gear && (
              <div className="border-t border-gray-100 print:border-black p-6">
                <div className="space-y-8">
                  {Object.entries(groupedRegularGear).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-xl font-light mb-4">{category}</h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center text-lg">
                            <div 
                              className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                                item.checked ? 'bg-primary-50' : ''
                              }`}
                              onClick={() => toggleGearChecked.mutate({ 
                                gearId: item.id, 
                                checked: !item.checked 
                              })}
                            >
                              {item.checked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className={item.checked ? 'line-through decoration-[#558455] decoration-wavy decoration-2' : ''}>
                              {(item.gear as any).name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                              )}
                              <span className="ml-2 text-gray-500">
                                {formatWeight((item.gear as any).weight_kg * item.quantity)}
                              </span>
                              {item.notes && (
                                <span className="ml-2 text-gray-500 text-base">
                                  - {item.notes}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wearable Items Section */}
        {Object.keys(groupedWearableGear).length > 0 && (
          <div className="card print:shadow-none print:border-black print:break-before-page">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection('wearable')}
            >
              <h2 className="text-2xl font-light">Wearable Items</h2>
              <button className="print:hidden">
                {expandedSections.wearable ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {expandedSections.wearable && (
              <div className="border-t border-gray-100 print:border-black p-6">
                <div className="space-y-8">
                  {Object.entries(groupedWearableGear).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-xl font-light mb-4">{category}</h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center text-lg">
                            <div 
                              className={`h-6 w-6 border border-gray-300 print:border-black mr-4 cursor-pointer relative ${
                                item.checked ? 'bg-primary-50' : ''
                              }`}
                              onClick={() => toggleGearChecked.mutate({ 
                                gearId: item.id, 
                                checked: !item.checked 
                              })}
                            >
                              {item.checked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className={item.checked ? 'line-through decoration-[#558455] decoration-wavy decoration-2' : ''}>
                              {(item.gear as any).name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-gray-600">({item.quantity}x)</span>
                              )}
                              <span className="ml-2 text-gray-500">
                                {formatWeight((item.gear as any).weight_kg * item.quantity)}
                              </span>
                              {item.notes && (
                                <span className="ml-2 text-gray-500 text-base">
                                  - {item.notes}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}