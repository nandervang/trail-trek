import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';

interface HikeFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  start_location: string;
  end_location: string;
  distance_miles: number;
  type: string;
  difficulty_level: string;
  elevation_gain: number;
}

export default function HikeForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<HikeFormData>({
    defaultValues: {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      start_location: '',
      end_location: '',
      distance_miles: 0,
      type: 'day_hike',
      difficulty_level: 'moderate',
      elevation_gain: 0,
    }
  });

  const { data: hike, isLoading } = useQuery({
    queryKey: ['hike', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const createHike = useMutation({
    mutationFn: async (data: HikeFormData) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data: newHike, error } = await supabase
        .from('hikes')
        .insert([{ 
          ...data,
          user_id: user.id,
          status: 'planned'
        }])
        .select()
        .single();
        
      if (error) throw error;
      return newHike;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      toast.success('Hike created successfully');
      navigate(`/hikes/${data.id}/planner`);
    },
    onError: (error) => {
      toast.error(`Failed to create hike: ${error.message}`);
    },
  });

  const updateHike = useMutation({
    mutationFn: async (data: HikeFormData) => {
      if (!user || !id) throw new Error("Invalid operation");
      
      const { data: updatedHike, error } = await supabase
        .from('hikes')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return updatedHike;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hikes'] });
      queryClient.invalidateQueries({ queryKey: ['hike', id] });
      toast.success('Hike updated successfully');
      navigate(`/hikes/${id}`);
    },
    onError: (error) => {
      toast.error(`Failed to update hike: ${error.message}`);
    },
  });

  const onSubmit = (data: HikeFormData) => {
    if (isEditMode) {
      updateHike.mutate(data);
    } else {
      createHike.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex items-center"
      >
        <Link to="/hikes" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Hike' : 'Plan New Hike'}</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Hike Name *</label>
            <input
              type="text"
              className={`input ${errors.name ? 'border-error-500' : ''}`}
              {...register('name', { required: 'Name is required' })}
              placeholder="Give your hike a name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              {...register('description')}
              placeholder="Describe your hike"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                {...register('start_date')}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                {...register('end_date')}
              />
            </div>

            <div>
              <label className="label">Starting Point</label>
              <input
                type="text"
                className="input"
                {...register('start_location')}
                placeholder="Where does the hike start?"
              />
            </div>

            <div>
              <label className="label">Destination</label>
              <input
                type="text"
                className="input"
                {...register('end_location')}
                placeholder="Where does the hike end?"
              />
            </div>

            <div>
              <label className="label">Distance (miles)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                {...register('distance_miles', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Distance must be positive' }
                })}
              />
              {errors.distance_miles && (
                <p className="mt-1 text-sm text-error-500">{errors.distance_miles.message}</p>
              )}
            </div>

            <div>
              <label className="label">Elevation Gain (meters)</label>
              <input
                type="number"
                className="input"
                {...register('elevation_gain', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Elevation gain must be positive' }
                })}
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select className="input" {...register('type')}>
                <option value="day_hike">Day Hike</option>
                <option value="overnight">Overnight</option>
                <option value="multi_day">Multi-day Trek</option>
                <option value="thru_hike">Thru-hike</option>
              </select>
            </div>

            <div>
              <label className="label">Difficulty Level</label>
              <select className="input" {...register('difficulty_level')}>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="difficult">Difficult</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link to="/hikes" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Hike' : 'Create Hike'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}