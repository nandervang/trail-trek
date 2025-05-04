import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import BasicInfo from '@/components/hikes/form/BasicInfo';
import LocationPicker from '@/components/hikes/form/LocationPicker';
import RouteDetails from '@/components/hikes/form/RouteDetails';
import type { HikeFormData } from '@/components/hikes/form/types';

export default function HikeForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<HikeFormData>();

  // Fetch hike data if in edit mode
  const { data: hike, isLoading } = useQuery({
    queryKey: ['hike', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      console.log('Fetching hike data for id:', id);
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching hike:', error);
        throw error;
      }
      console.log('Fetched hike data:', data);
      return data;
    },
    enabled: !!user && !!id,
  });

  // Effect to populate form when data is loaded
  React.useEffect(() => {
    if (hike) {
      console.log('Resetting form with hike data:', hike);
      reset({
        name: hike.name,
        description: hike.description || '',
        start_date: hike.start_date || '',
        end_date: hike.end_date || '',
        start_location: hike.start_location || '',
        end_location: hike.end_location || '',
        start_coordinates: hike.start_coordinates as [number, number] || null,
        end_coordinates: hike.end_coordinates as [number, number] || null,
        distance_km: hike.distance_km || 0,
        type: hike.type || 'day_hike',
        difficulty_level: hike.difficulty_level || 'moderate',
        elevation_gain: hike.elevation_gain || 0,
      });
    }
  }, [hike, reset]);

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
    console.log('Form submitted with data:', data);
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
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <BasicInfo register={register} errors={errors} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="space-y-6">
                <LocationPicker
                  label="Starting Point"
                  value={watch('start_location')}
                  coordinates={watch('start_coordinates')}
                  onChange={(location, coordinates) => {
                    setValue('start_location', location);
                    setValue('start_coordinates', coordinates);
                  }}
                />

                <LocationPicker
                  label="Destination"
                  value={watch('end_location')}
                  coordinates={watch('end_coordinates')}
                  onChange={(location, coordinates) => {
                    setValue('end_location', location);
                    setValue('end_coordinates', coordinates);
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              <RouteDetails register={register} errors={errors} />
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
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