import { Image as ImageIcon, ChevronUp } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';

interface GallerySectionProps {
  images: string[];
  descriptions?: string[];
  expanded: boolean;
  onToggle?: () => void; // Made optional to support viewOnly mode
  onImagesChange?: (images: string[], descriptions?: string[]) => void; // Made optional to support viewOnly mode
  onUpload?: (files: File[]) => Promise<void>;
  viewOnly?: boolean; // New prop to disable editing functionality
}

export default function GallerySection({ 
  images, 
  descriptions, 
  expanded, 
  onToggle,
  onImagesChange,
  onUpload,
  viewOnly = false // Default to false
}: GallerySectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className={`flex justify-between items-center px-6 py-4 ${!viewOnly ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={!viewOnly ? onToggle : undefined} // Disable toggle functionality in viewOnly mode
      >
        <h2 className="text-xl font-light flex items-center">
          <ImageIcon className="h-6 w-6 mr-3 text-primary-600" />
          Image Gallery
        </h2>
        {expanded && !viewOnly && (
          <ChevronUp className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-6">
          {viewOnly ? (
            <div>
              {/* Render images and descriptions without editing functionality */}
              {images.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={descriptions ? descriptions[index] : `Image ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <ImageGallery
              images={images}
              descriptions={descriptions}
              onImagesChange={onImagesChange}
              onUpload={onUpload}
            />
          )}
        </div>
      )}
    </div>
  );
}