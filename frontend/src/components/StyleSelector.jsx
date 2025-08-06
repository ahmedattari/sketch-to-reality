import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const StyleSelector = ({ selectedStyle, onStyleSelect }) => {
  const [styles, setStyles] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await ApiService.getStyles();
        setStyles(response.styles);
      } catch (error) {
        console.error('Failed to fetch styles:', error);
        // Fallback styles
        setStyles({
          realistic: { name: 'Realistic', description: 'Photorealistic, detailed' },
          cartoon: { name: 'Cartoon', description: 'Animated, colorful style' },
          anime: { name: 'Anime', description: 'Japanese anime/manga style' },
          oil_painting: { name: 'Oil Painting', description: 'Classical art style' },
          watercolor: { name: 'Watercolor', description: 'Soft painting style' },
          digital_art: { name: 'Digital Art', description: 'Modern concept art' },
          cyberpunk: { name: 'Cyberpunk', description: 'Futuristic sci-fi' },
          fantasy: { name: 'Fantasy', description: 'Magical, ethereal' },
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStyles();
  }, []);
  
  const styleIcons = {
    realistic: '📸',
    cartoon: '🎨',
    anime: '🌸',
    oil_painting: '🖼️',
    watercolor: '🎭',
    digital_art: '💻',
    cyberpunk: '🤖',
    fantasy: '✨',
  };
  
  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="text-xl font-semibold text-white mb-4 text-shadow">
          Choose Style
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-white/20 rounded mb-1"></div>
              <div className="h-3 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card">
      <h2 className="text-xl font-semibold text-white mb-4 text-shadow">
        Choose Style
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(styles).map(([key, style]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStyleSelect(key)}
            className={`
              relative p-4 rounded-xl text-center transition-all duration-300 overflow-hidden
              ${selectedStyle === key
                ? 'bg-white/20 border-2 border-white/50 shadow-lg'
                : 'glass hover:bg-white/15 border border-white/20'
              }
            `}
          >
            {/* Background gradient effect */}
            <div className={`
              absolute inset-0 opacity-0 transition-opacity duration-300
              ${selectedStyle === key ? 'opacity-100' : 'hover:opacity-50'}
              bg-gradient-to-br from-white/10 to-transparent
            `} />
            
            <div className="relative z-10">
              <div className="text-2xl mb-2">
                {styleIcons[key] || '🎨'}
              </div>
              
              <h3 className="text-white font-medium text-sm mb-1">
                {style.name}
              </h3>
              
              <p className="text-white/60 text-xs leading-tight">
                {style.description}
              </p>
            </div>
            
            {/* Selection indicator */}
            {selectedStyle === key && (
              <motion.div
                layoutId="styleSelector"
                className="absolute inset-0 border-2 border-white/60 rounded-xl"
                initial={false}
                transition={{ type: "spring", duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;