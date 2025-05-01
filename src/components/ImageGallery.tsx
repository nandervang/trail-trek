import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ImageGalleryProps {
  images: string[];
  descriptions?: string[];
  onImagesChange: (images: string[], descriptions?: string[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
}

export default function ImageGallery({ images, descriptions = [], onImagesChange, onUpload }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': []
    },
    maxFiles: 10,
    onDrop: async (acceptedFiles) => {
      if (!onUpload) return;
      
      try {
        setUploading(true);
        await onUpload(acceptedFiles);
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setUploading(false);
      }
    }
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newDescriptions = [...descriptions];
    newImages.splice(index, 1);
    newDescriptions.splice(index, 1);
    onImagesChange(newImages, newDescriptions);
  };

  const updateDescription = (index: number, description: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = description;
    onImagesChange(images, newDescriptions);
    setEditingIndex(null);
  };

  const getCharacterCount = (text: string) => {
    return `${text.length}/150`;
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading images...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-primary-500 mb-2" />
            <p className="text-gray-600">Drop the files here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">Drag & drop images here, or click to select files</p>
            <p className="text-xs text-gray-500">Upload up to 10 images</p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {images.map((url, index) => (
            <div key={index} className="relative group card overflow-hidden">
              <div className="aspect-auto">
                <Zoom>
                  <img
                    src={url}
                    alt={descriptions[index] || `Hike photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Zoom>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 transition-opacity hover:bg-black/75"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="p-4 bg-white border-t border-gray-100">
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full text-sm bg-gray-50 rounded p-2 resize-none border border-gray-200"
                      value={editingDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 150) {
                          setEditingDescription(e.target.value);
                        }
                      }}
                      placeholder="Add a description..."
                      maxLength={150}
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {getCharacterCount(editingDescription)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateDescription(index, editingDescription)}
                          className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="min-h-[3rem] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => {
                      setEditingIndex(index);
                      setEditingDescription(descriptions[index] || '');
                    }}
                  >
                    {descriptions[index] ? (
                      <p className="text-sm text-gray-700">{descriptions[index]}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Add description...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No images added yet</p>
        </div>
      )}
    </div>
  );
}