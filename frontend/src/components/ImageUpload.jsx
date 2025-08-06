import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { isValidImageType, formatFileSize } from '../utils/helpers';

const ImageUpload = ({ onImageSelect, selectedImage, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    if (rejectedFiles.length > 0) {
      alert('Please upload a valid image file (JPG, PNG, WebP, BMP)');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageSelect(file);
    }
  }, [onImageSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    multiple: false,
    maxSize: 10485760 // 10MB
  });

  return (
    <div className="glass-card">
      <h2 className="text-xl font-semibold text-white mb-4 text-shadow">
        Upload Your Sketch
      </h2>
      
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              ${dragActive || isDragActive 
                ? 'border-white/60 bg-white/10 scale-105' 
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <motion.div
              animate={{ 
                scale: dragActive || isDragActive ? 1.1 : 1,
                rotate: dragActive || isDragActive ? 5 : 0 
              }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <Upload className="w-12 h-12 text-white/60 mx-auto" />
            </motion.div>
            
            <p className="text-white text-lg font-medium mb-2">
              {dragActive || isDragActive ? 'Drop your sketch here!' : 'Drag & drop your sketch'}
            </p>
            
            <p className="text-white/60 text-sm mb-4">
              or click to browse files
            </p>
            
            <div className="text-white/40 text-xs">
              Supports: JPG, PNG, WebP, BMP • Max size: 10MB
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="relative group">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected sketch"
                className="w-full h-48 object-contain rounded-xl bg-white/5 backdrop-blur-sm"
              />
              
              <button
                onClick={onRemove}
                className="absolute top-2 right-2 glass-button w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-white/70">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>{selectedImage.name}</span>
              </div>
              <span>{formatFileSize(selectedImage.size)}</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.querySelector('input[type="file"]').click()}
              className="glass-button w-full"
            >
              Choose Different Image
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;