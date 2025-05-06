import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GearDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gear: {
    name: string;
    description: string | null;
    purpose: string | null;
    volume: string | null;
    sizes: string | null;
    category: {
      name: string;
    };
  };
}

export default function GearDetailsModal({ isOpen, onClose, gear }: GearDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-lg z-50"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{gear.name}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {gear.description && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Description</h3>
                    <p className="text-gray-800">{gear.description}</p>
                  </div>
                )}

                {gear.purpose && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Purpose & Use Cases</h3>
                    <p className="text-gray-800">{gear.purpose}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {gear.volume && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Volume</h3>
                      <p className="text-gray-800">{gear.volume}</p>
                    </div>
                  )}

                  {gear.sizes && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Sizes</h3>
                      <p className="text-gray-800">{gear.sizes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}