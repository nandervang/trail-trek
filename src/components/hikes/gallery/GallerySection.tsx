import { Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';

interface GallerySectionProps {
  images: string[];
  descriptions?: string[];
  expanded: boolean;
  onToggle: () => void;
  onImagesChange: (images: string[], descriptions?: string[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
}

export default function GallerySection({ 
  images, 
  descriptions, 
  expanded, 
  onToggle,
  onImagesChange,
  onUpload 
}: GallerySectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-xl font-light flex items-center">
          <ImageIcon className="h-6 w-6 mr-3 text-primary-600" />
          Image Gallery
        </h2>
        {expanded ? (
          <ChevronUp className="h-6 w-6 text-gray-400" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          <ImageGallery
            images={images}
            descriptions={descriptions}
            onImagesChange={onImagesChange}
            onUpload={onUpload}
          />
        </div>
      )}
    </div>
  );
}