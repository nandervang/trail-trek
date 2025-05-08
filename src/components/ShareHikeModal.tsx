import { useState } from 'react';
import { X, Copy, Key, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ShareHikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hike: any;
}

export default function ShareHikeModal({ isOpen, onClose, hike }: ShareHikeModalProps) {
  const queryClient = useQueryClient();
  const [shareEnabled, setShareEnabled] = useState(hike.share_enabled || false);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shareLogs, setShareLogs] = useState(hike.share_logs || false);
  const [shareGallery, setShareGallery] = useState(hike.share_gallery || false);

  const shareUrl = `${window.location.origin}/shared/${hike.share_id}`;

  const updateSharing = useMutation({
    mutationFn: async (data: Partial<typeof hike>) => {
      const { error } = await supabase
        .from('hikes')
        .update(data)
        .eq('id', hike.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike', hike.id] });
      toast.success('Sharing settings updated');
    },
    onError: (error) => {
      toast.error(`Failed to update sharing settings: ${error.message}`);
    },
  });

  const handleSave = () => {
    const shareId = hike.share_id || generateShareId(); // Generate if missing
    updateSharing.mutate({
      share_enabled: shareEnabled,
      is_public: shareEnabled, // Set is_public to true when sharing is enabled
      share_id: shareId,
      share_logs: shareLogs, // Include share_logs
      share_gallery: shareGallery, // Include share_gallery
      share_expires_at: expirationDate || null,
      share_password: password || null,
    });
  };

  const generateShareId = () => {
    return Math.random().toString(36).substr(2, 9); // Example ID generator
  };

  console.log('Share ID:', hike.share_id); // Debugging log
  console.log('Share URL:', shareUrl); // Debugging log

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-20" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-lg shadow-lg z-30 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-light">Share Hike</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Enable Sharing Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Share this hike</h3>
                  <p className="text-sm text-gray-500">Allow others to view this hike</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={shareEnabled}
                    onChange={(e) => setShareEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {shareEnabled && (
                <>
                  {/* Share Link */}
                  <div>
                    <label className="label">Share Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="input flex-1"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="btn btn-outline flex items-center"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Expiration Date */}
                  <div>
                    <label className="label flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      className="input"
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Optional. Leave blank for no expiration.
                    </p>
                  </div>

                  {/* Password Protection */}
                  <div>
                    <label className="label flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Password Protection
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input pr-24"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Optional password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 px-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Optional. Add a password for extra security.
                    </p>
                  </div>

                  {/* Share Logs */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Share Logs</h3>
                      <p className="text-sm text-gray-500">Allow others to view hike logs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={shareLogs}
                        onChange={(e) => setShareLogs(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Share Image Gallery */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Share Image Gallery</h3>
                      <p className="text-sm text-gray-500">Allow others to view the image gallery</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={shareGallery}
                        onChange={(e) => setShareGallery(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={onClose} className="btn btn-outline">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}