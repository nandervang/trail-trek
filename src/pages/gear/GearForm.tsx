import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import useCategories from '@/hooks/useCategories';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash, Image as ImageIcon, Wand } from 'lucide-react';
import type { Database } from '@/types/supabase';

type GearItem = Database['public']['Tables']['gear_items']['Row'] & {
  purpose: string | null;
  volume: string | null;
  sizes: string | null;
};

type GearItemFormData = {
  name: string;
  description: string;
  weight_kg: number;
  category_id: string;
  quantity: number;
  is_worn: boolean;
  image_url: string;
  location: string;
  notes: string;
  purpose: string;
  volume: string;
  sizes: string;
};

export default function GearForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const isEditMode = !!id;
  
  const { categories, createCategory } = useCategories();
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<GearItemFormData>();
  
  const { data: gearItem, isLoading } = useQuery({
    queryKey: ['gear', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('gear_items')
        .select('*, category:categories(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data as GearItem;
    },
    enabled: !!user && !!id,
  });

  const getGearInfo = async () => {
    setIsLoadingAI(true);
    try {
      const name = watch('name');
      const category = categories?.find(c => c.id === watch('category_id'))?.name;
      
      if (!name || !category) {
        toast.error('Please enter a name and select a category first');
        return;
      }
  
      // Debug log to check environment variables
      console.log('API URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Auth key available:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-gear-info`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, category }),
        }
      );
  
      // Log response status to diagnose issues
      console.log('Response status:', response.status);
      
      // Special handling for quota exceeded errors
      if (response.status === 429) {
        const errorData = await response.json();
        toast.error(errorData.message || 'AI service quota exceeded. You can still enter gear details manually.');
        return;
      }
      
      // For other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      const data = await response.json();
      
      // Check if we got mock data instead of AI data
      if (data._source === "mock_data") {
        toast.info('Using estimated data. The AI service is currently unavailable.');
      }
      
      // Update form values with the received data
      setValue('description', data.description || '');
      setValue('purpose', data.purpose || '');
      setValue('weight_kg', data.weight_kg || 0);
      
      if (data.volume) setValue('volume', data.volume);
      if (data.sizes) setValue('sizes', data.sizes);
      if (data.image_url) setValue('image_url', data.image_url);
      
      toast.success('Gear information loaded!');
    } catch (error) {
      console.error('AI Info Error:', error);
      toast.error('Failed to get gear information. Please try again or enter details manually.');
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  useEffect(() => {
    if (gearItem) {
      reset({
        name: gearItem.name,
        description: gearItem.description || '',
        weight_kg: gearItem.weight_kg,
        category_id: gearItem.category_id,
        quantity: gearItem.quantity || 1,
        is_worn: gearItem.is_worn || false,
        image_url: gearItem.image_url || '',
        location: gearItem.location || '',
        notes: gearItem.notes || '',
        purpose: gearItem.purpose || '',
        volume: gearItem.volume || '',
        sizes: gearItem.sizes || '',
      });
      if (gearItem.image_url) {
        setImagePreview(gearItem.image_url);
      }
    }
  }, [gearItem, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const filename = `${user!.id}/${timestamp}-${file.name}`;
    
    const { error } = await supabase.storage
      .from('gear-images')
      .upload(filename, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('gear-images')
      .getPublicUrl(filename);
      
    return publicUrl;
  };
  
  const createGear = useMutation({
    mutationFn: async (data: GearItemFormData) => {
      if (!user) throw new Error("User not authenticated");
      
      let image_url = data.image_url;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
      
      const { data: newGear, error } = await supabase
        .from('gear_items')
        .insert([{ 
          ...data, 
          user_id: user.id,
          image_url,
        }])
        .select()
        .single();
        
      if (error) throw error;
      return newGear;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gear'] });
      toast.success('Gear added successfully');
      navigate('/gear');
    },
    onError: (error) => {
      toast.error(`Failed to add gear: ${error.message}`);
    },
  });
  
  const updateGear = useMutation({
    mutationFn: async (data: GearItemFormData) => {
      if (!user || !id) throw new Error("Invalid operation");
      
      let image_url = data.image_url;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
      
      const { data: updatedGear, error } = await supabase
        .from('gear_items')
        .update({
          ...data,
          image_url,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return updatedGear;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gear'] });
      queryClient.invalidateQueries({ queryKey: ['gear', id] });
      toast.success('Gear updated successfully');
      navigate('/gear');
    },
    onError: (error) => {
      toast.error(`Failed to update gear: ${error.message}`);
    },
  });
  
  const deleteGear = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Invalid operation");
      
      const { error } = await supabase
        .from('gear_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gear'] });
      toast.success('Gear deleted successfully');
      navigate('/gear');
    },
    onError: (error) => {
      toast.error(`Failed to delete gear: ${error.message}`);
    },
  });
  
  const onSubmit = (data: GearItemFormData) => {
    if (isEditMode) {
      updateGear.mutate(data);
    } else {
      createGear.mutate(data);
    }
  };
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      const result = await createCategory.mutateAsync(newCategory.trim());
      if (result) {
        setValue('category_id', result.id);
        setNewCategory('');
        setShowNewCategoryForm(false);
        toast.success(`Category "${newCategory}" created`);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this gear item? This action cannot be undone.')) {
      deleteGear.mutate();
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
        <Link to="/gear" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Gear' : 'Add New Gear'}</h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="label">
                Item Name *
              </label>
              <input
                id="name"
                className={`input ${errors.name ? 'border-error-500 focus:border-error-500' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="weight_kg" className="label">
                Weight (kg) *
              </label>
              <input
                id="weight_kg"
                type="number"
                step="0.001"
                className={`input ${errors.weight_kg ? 'border-error-500 focus:border-error-500' : ''}`}
                {...register('weight_kg', { 
                  required: 'Weight is required',
                  min: { value: 0, message: 'Weight must be positive' },
                  valueAsNumber: true
                })}
              />
              {errors.weight_kg && (
                <p className="mt-1 text-sm text-error-500">{errors.weight_kg.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category" className="label">
                Category *
              </label>
              {!showNewCategoryForm ? (
                <div className="flex">
                  <select
                    id="category"
                    className={`input flex-1 ${errors.category_id ? 'border-error-500 focus:border-error-500' : ''}`}
                    {...register('category_id', { required: 'Category is required' })}
                  >
                    <option value="">Select a category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryForm(true)}
                    className="ml-2 btn btn-outline flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> New
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    className="input flex-1"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="ml-2 btn btn-primary"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryForm(false)}
                    className="ml-2 btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {errors.category_id && (
                <p className="mt-1 text-sm text-error-500">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="label">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                className="input"
                {...register('quantity', { 
                  min: { value: 1, message: 'Quantity must be at least 1' },
                  valueAsNumber: true
                })}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-error-500">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="label">
                Storage Location
              </label>
              <input
                id="location"
                type="text"
                className="input"
                {...register('location')}
                placeholder="Where is this item stored?"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  {...register('is_worn')}
                />
                <span className="text-gray-700">This is a wearable item</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Wearable items are counted separately in pack weight calculations
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="input"
                {...register('description')}
                placeholder="General description and main features"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="purpose" className="label">
                Purpose & Use Cases
              </label>
              <textarea
                id="purpose"
                rows={3}
                className="input"
                {...register('purpose')}
                placeholder="Specific use cases and when to use this item"
              ></textarea>
            </div>

            <div>
              <label htmlFor="volume" className="label">
                Volume
              </label>
              <input
                id="volume"
                type="text"
                className="input"
                {...register('volume')}
                placeholder="e.g., 30L, 2000 cu.in."
              />
            </div>

            <div>
              <label htmlFor="sizes" className="label">
                Sizes/Dimensions
              </label>
              <input
                id="sizes"
                type="text"
                className="input"
                {...register('sizes')}
                placeholder="e.g., 20x30x40cm, M/L/XL"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                className="input"
                rows={3}
                {...register('notes')}
                placeholder="Additional notes about this item..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="label">Item Image</label>
              <div className="mt-2 flex items-start space-x-4">
                <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Upload an image of your gear item. This helps with identification and organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <div className="flex space-x-3">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn flex items-center text-error-600 bg-error-50 hover:bg-error-100"
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </button>
              )}
              <button
                type="button"
                onClick={getGearInfo}
                disabled={isLoadingAI}
                className="btn btn-outline flex items-center"
              >
                <Wand className="h-4 w-4 mr-2" />
                {isLoadingAI ? 'Getting Info...' : 'Get Info with AI'}
              </button>
            </div>
            <div className="flex space-x-3">
              <Link to="/gear" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}