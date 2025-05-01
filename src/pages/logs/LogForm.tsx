import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, CloudSun, CloudRain, Cloud, Sun, Thermometer, MapPin } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import ImageGallery from '@/components/ImageGallery';
import { uploadImage } from '@/lib/storage';

type LogFormData = {
  title: string;
  date: string;
  time: string;
  location: string;
  distance_km: number;
  weather: string;
  temperature: number;
  conditions: string[];
  mood: number;
  difficulty: number;
  notes: string;
  images: string[];
};

const weatherConditions = [
  { value: 'sunny', label: 'Sunny', icon: Sun },
  { value: 'cloudy', label: 'Cloudy', icon: Cloud },
  { value: 'partly_cloudy', label: 'Partly Cloudy', icon: CloudSun },
  { value: 'rainy', label: 'Rainy', icon: CloudRain },
];

const moodEmojis = ['😫', '😕', '😐', '🙂', '😊'];
const difficultyLabels = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'];

export default function LogForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [markdownContent, setMarkdownContent] = useState('');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LogFormData>({
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      distance_km: 0,
      weather: '',
      temperature: 20,
      conditions: [],
      mood: 3,
      difficulty: 2,
      notes: '',
      images: [],
    }
  });
  
  const mood = watch('mood');
  const difficulty = watch('difficulty');
  
  // Fetch hike details to confirm it exists and is in progress
  const { data: hike, isLoading } = useQuery({
    queryKey: ['hike', id],
    queryFn: async () => {
      if (!user || !id) throw new Error("Invalid request");
      
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
  
  // Create a new log entry
  const createLog = useMutation({
    mutationFn: async (data: LogFormData) => {
      if (!user || !id) throw new Error("Invalid operation");
      
      const { data: newLog, error } = await supabase
        .from('hike_logs')
        .insert([{ 
          hike_id: id,
          title: data.title,
          date: data.date,
          time: data.time,
          location: data.location,
          distance_km: data.distance_km,
          weather: data.weather,
          temperature: data.temperature,
          conditions: data.conditions,
          mood: data.mood,
          difficulty: data.difficulty,
          notes: data.notes,
          images: data.images,
        }])
        .select()
        .single();
        
      if (error) throw error;
      return newLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-logs', id] });
      toast.success('Log entry added successfully');
      navigate(`/hikes/${id}`);
    },
    onError: (error) => {
      toast.error(`Failed to add log entry: ${error.message}`);
    },
  });

  const handleImageUpload = async (files: File[]) => {
    if (!id) return;
    
    try {
      const uploadPromises = files.map(file => uploadImage(file, id));
      const imageUrls = await Promise.all(uploadPromises);
      
      setValue('images', [...watch('images'), ...imageUrls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };
  
  const onSubmit = (data: LogFormData) => {
    createLog.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!hike) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hike not found</h2>
          <p className="text-gray-600 mb-6">The hike you're trying to log doesn't exist or you don't have permission to view it.</p>
          <Link to="/hikes" className="btn btn-primary">
            Back to Hikes
          </Link>
        </div>
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
        <Link to={`/hikes/${id}`} className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Add Log Entry</h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-6">{hike.name}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input"
              {...register('title')}
              placeholder="Give your log entry a title (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="label">
                Date *
              </label>
              <input
                id="date"
                type="date"
                className={`input ${errors.date ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-error-500">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="time" className="label">
                Time
              </label>
              <input
                id="time"
                type="time"
                className="input"
                {...register('time')}
              />
            </div>

            <div>
              <label htmlFor="location" className="label">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-2 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="location"
                  type="text"
                  className="input pl-10"
                  {...register('location')}
                  placeholder="Where were you?"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="distance_km" className="label">
                Distance (km)
              </label>
              <input
                id="distance_km"
                type="number"
                step="0.1"
                className="input"
                {...register('distance_km', { 
                  min: { value: 0, message: 'Distance must be positive' },
                  valueAsNumber: true
                })}
              />
              {errors.distance_km && (
                <p className="mt-1 text-sm text-error-500">{errors.distance_km.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="label">Weather Conditions</label>
            <div className="grid grid-cols-2 gap-2">
              {weatherConditions.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`
                    flex items-center p-3 rounded border cursor-pointer transition-colors
                    ${watch('conditions')?.includes(value)
                      ? 'bg-primary-50 border-primary-500'
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    value={value}
                    className="sr-only"
                    {...register('conditions')}
                  />
                  <Icon className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="temperature" className="label">
              Temperature (°C)
            </label>
            <div className="flex items-center">
              <Thermometer className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="range"
                min="-20"
                max="45"
                className="flex-1"
                {...register('temperature', { valueAsNumber: true })}
              />
              <span className="ml-2 min-w-[4rem] text-right">
                {watch('temperature')}°C
              </span>
            </div>
          </div>
          
          <div>
            <label className="label">Mood</label>
            <div className="flex justify-between items-center px-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className={`text-2xl transition-transform ${
                    mood === index + 1 ? 'transform scale-125' : 'opacity-50 hover:opacity-75'
                  }`}
                  onClick={() => setValue('mood', index + 1)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="label">Difficulty</label>
            <div className="flex justify-between items-center px-2">
              {difficultyLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    difficulty === index + 1
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setValue('difficulty', index + 1)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="label">Trail Journal</label>
            <div data-color-mode="light">
              <MDEditor
                value={markdownContent}
                onChange={(value) => {
                  setMarkdownContent(value || '');
                  setValue('notes', value || '');
                }}
                preview="edit"
                height={400}
                className="!border-gray-200"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Use markdown to format your text. You can add headers, lists, bold text, and more.
            </p>
          </div>

          <div>
            <label className="label">Photos</label>
            <ImageGallery
              images={watch('images')}
              onImagesChange={(newImages) => setValue('images', newImages)}
              onUpload={handleImageUpload}
            />
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <Link to={`/hikes/${id}`} className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Log Entry
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}