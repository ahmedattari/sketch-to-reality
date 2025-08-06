import { motion } from 'framer-motion';
import { Download, RotateCcw, Info } from 'lucide-react';
import { downloadImage } from '../utils/helpers';

const ImageComparison = ({ originalImage, generatedImage, generationInfo, onRegenerate }) => {
  const handleDownload = () => {
    if (generatedImage) {
      downloadImage(generatedImage, `sketch-to-reality-${Date.now()}.png`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white text-shadow">
          Your Masterpiece
        </h2>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegenerate}
            className="glass-button flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Regenerate</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="glass-button flex items-center space-x-2 bg-green-500/20 border-green-400/30"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </motion.button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Sketch */}
        <div className="space-y-3">
          <h3 className="text-white/80 font-medium flex items-center space-x-2">
            <span>Original Sketch</span>
          </h3>
          
          <div className="relative group">
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original sketch"
              className="w-full aspect-square object-contain rounded-xl bg-white/5 backdrop-blur-sm"
            />
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-medium">Original</span>
            </div>
          </div>
        </div>
        
        {/* Generated Image */}
        <div className="space-y-3">
          <h3 className="text-white/80 font-medium flex items-center space-x-2">
            <span>Generated Art</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-yellow-400"
            >
              ✨
            </motion.span>
          </h3>
          
          <div className="relative group">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              src={`data:image/png;base64,${generatedImage}`}
              alt="Generated artwork"
              className="w-full aspect-square object-contain rounded-xl bg-white/5 backdrop-blur-sm shadow-2xl"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </div>
        </div>
      </div>
      
      {/* Generation Info */}
      {generationInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 glass rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm font-medium">Generation Details</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white/60">
            <div>
              <span className="block text-white/40">Style</span>
              <span className="capitalize">{generationInfo.style?.replace('_', ' ')}</span>
            </div>
            
            <div>
              <span className="block text-white/40">Steps</span>
              <span>{generationInfo.steps}</span>
            </div>
            
            <div>
              <span className="block text-white/40">CFG Scale</span>
              <span>{generationInfo.cfg_scale}</span>
            </div>
            
            <div>
              <span className="block text-white/40">Sampler</span>
              <span>{generationInfo.sampler}</span>
            </div>
          </div>
          
          {generationInfo.prompt && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="block text-white/40 text-xs mb-1">Final Prompt</span>
              <p className="text-white/60 text-xs leading-relaxed">
                {generationInfo.prompt}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageComparison;