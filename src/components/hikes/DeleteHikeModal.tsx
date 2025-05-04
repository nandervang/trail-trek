import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteHikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hikeName: string;
}

export default function DeleteHikeModal({ isOpen, onClose, onConfirm, hikeName }: DeleteHikeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Delete Hike</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{hikeName}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="btn bg-error-600 text-white hover:bg-error-700"
                >
                  Delete Hike
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}