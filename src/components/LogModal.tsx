import { useState, useEffect } from 'react';
import { X, CloudSun, CloudRain, Cloud, Sun, Thermometer, MapPin, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';
import ImageGallery from './ImageGallery';
import { uploadImage } from '@/lib/storage';
import { format, parseISO } from 'date-fns';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
  hikeId: string;
}

export default function LogModal({ isOpen, onClose, log, hikeId }: LogModalProps) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: log?.title || '',
    date: log?.date || new Date().toISOString().split('T')[0],
    time: log?.time || '',
    location: log?.location || '',
    distance_km: log?.distance_km || 0,
    weather: log?.weather || '',
    temperature: log?.temperature || 20,
    conditions: log?.conditions || [],
    mood: log?.mood || 3,
    difficulty: log?.difficulty || 3,
    notes: log?.notes || '',
    images: log?.images || [],
  });

  useEffect(() => {
    setFormData({
      title: log?.title || '',
      date: log?.date || new Date().toISOString().split('T')[0],
      time: log?.time || '',
      location: log?.location || '',
      distance_km: log?.distance_km || 0,
      weather: log?.weather || '',
      temperature: log?.temperature || 20,
      conditions: log?.conditions || [],
      mood: log?.mood || 3,
      difficulty: log?.difficulty || 3,
      notes: log?.notes || '',
      images: log?.images || [],
    });
  }, [log]);

  const weatherConditions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'partly_cloudy', label: 'Partly Cloudy', icon: CloudSun },
    { value: 'rainy', label: 'Rainy', icon: CloudRain },
  ];

  const moodEmojis = ['😫', '😕', '😐', '🙂', '😊'];
  const difficultyLabels = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'];

  const updateLog = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!log?.id) return;
      const { error } = await supabase
        .from('hike_logs')
        .update(data)
        .eq('id', log.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike-logs', hikeId] });
      setEditMode(false);
      toast.success('Log updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update log: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLog.mutate(formData);
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => uploadImage(file, hikeId));
      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls]
      }));
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  if (!log) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-20" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-lg shadow-lg z-30 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-light">Log Entry</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="label">Title</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Give your log entry a title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Date</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Time</label>
                      <input
                        type="time"
                        className="input"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Location</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where were you?"
                    />
                  </div>

                  <div>
                    <label className="label">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={formData.distance_km}
                      onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="label">Weather Conditions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {weatherConditions.map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className={`
                            flex items-center p-3 rounded border cursor-pointer transition-colors
                            ${formData.conditions?.includes(value)
                              ? 'bg-primary-50 border-primary-500'
                              : 'border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            value={value}
                            checked={formData.conditions?.includes(value)}
                            onChange={(e) => {
                              const conditions = e.target.checked
                                ? [...(formData.conditions || []), value]
                                : formData.conditions?.filter((c: string) => c !== value) || [];
                              setFormData({ ...formData, conditions });
                            }}
                            className="sr-only"
                          />
                          <Icon className="h-4 w-4 mr-1" />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Temperature (°C)</label>
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="range"
                        min="-20"
                        max="45"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="ml-2 min-w-[4rem] text-right">
                        {formData.temperature}°C
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
                            formData.mood === index + 1 ? 'transform scale-125' : 'opacity-50 hover:opacity-75'
                          }`}
                          onClick={() => setFormData({ ...formData, mood: index + 1 })}
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
                            formData.difficulty === index + 1
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setFormData({ ...formData, difficulty: index + 1 })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={formData.notes}
                        onChange={(value) => setFormData({ ...formData, notes: value || '' })}
                        preview="edit"
                        height={200}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Images</label>
                    <ImageGallery
                      images={formData.images}
                      onImagesChange={handleImagesChange}
                      onUpload={handleImageUpload}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">
                        {log?.title || (log?.date ? format(parseISO(log.date), 'MMMM d, yyyy') : 'Untitled Log')}
                      </h3>
                      <div className="mt-2 flex items-center text-gray-600 space-x-4">
                        {log?.date && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{format(parseISO(log.date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        {log?.time && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{log.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {log?.distance_km && (
                      <div className="text-right">
                        <div className="text-2xl font-light">{log.distance_km.toFixed(1)}</div>
                        <div className="text-sm text-gray-500">kilometers</div>
                      </div>
                    )}
                  </div>

                  {log?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {log.location}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {log?.temperature && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Temperature</h4>
                        <p className="text-lg">{log.temperature}°C</p>
                      </div>
                    )}

                    {log?.conditions && log.conditions.length > 0 && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Conditions</h4>
                        <div className="flex gap-2">
                          {log.conditions.map((condition: string) => {
                            const weatherCondition = weatherConditions.find(w => w.value === condition);
                            if (!weatherCondition) return null;
                            const Icon = weatherCondition.icon;
                            return (
                              <div
                                key={condition}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                              >
                                <Icon className="h-4 w-4 mr-1" />
                                {weatherCondition.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {log?.mood && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Mood</h4>
                        <p className="text-2xl">{moodEmojis[log.mood - 1]}</p>
                      </div>
                    )}

                    {log?.difficulty && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-1">Difficulty</h4>
                        <p className="text-lg">{difficultyLabels[log.difficulty - 1]}</p>
                      </div>
                    )}
                  </div>

                  {log?.notes && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Notes</h4>
                      <div data-color-mode="light" className="prose max-w-none">
                        <MDEditor.Markdown source={log.notes} />
                      </div>
                    </div>
                  )}

                  {log?.images && log.images.length > 0 && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Images</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {log.images.map((url: string, index: number) => (
                          <div key={index} className="aspect-square">
                            <img
                              src={url}
                              alt={`Log photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn btn-primary"
                    >
                      Edit Log
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}