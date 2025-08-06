import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, AlertTriangle } from 'lucide-react';

import ImageUpload from './components/ImageUpload';
import StyleSelector from './components/StyleSelector';
import ImageComparison from './components/ImageComparison';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ApiService from './services/api';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generationInfo, setGenerationInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);

  // Check API health on load
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await ApiService.checkHealth();
      setApiHealth(health);
    } catch (error) {
      setApiHealth({ status: 'unhealthy', sd_webui_available: false });
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setGeneratedImage(null);
    setGenerationInfo(null);
    setError(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setGenerationInfo(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await ApiService.generateImage(
        selectedImage,
        prompt.trim(),
        selectedStyle,
        negativePrompt.trim(),
        512,
        512
      );

      if (response.success) {
        setGeneratedImage(response.image_data);
        setGenerationInfo(response.generation_info);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedImage && prompt.trim()) {
      handleGenerate();
    }
  };

  const canGenerate = selectedImage && prompt.trim() && !loading;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center space-x-3 mb-4"
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl md:text-6xl font-bold text-white text-shadow">
            Sketch to Reality
          </h1>
          <Zap className="w-8 h-8 text-blue-400" />
        </motion.div>
        
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Transform your sketches into stunning artwork with AI-powered style transfer
        </p>

        {/* API Health Status */}
        {apiHealth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`
              inline-flex items-center space-x-2 mt-4 px-3 py-1 rounded-full text-xs
              ${apiHealth.sd_webui_available 
                ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                : 'bg-red-500/20 text-red-300 border border-red-400/30'
              }
            `}
          >
            <div className={`w-2 h-2 rounded-full ${apiHealth.sd_webui_available ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>
              {apiHealth.sd_webui_available ? 'AI Ready' : 'AI Unavailable'}
            </span>
            {!apiHealth.sd_webui_available && (
              <AlertTriangle className="w-3 h-3" />
            )}
          </motion.div>
        )}
      </motion.header>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <LoadingSpinner />
            </motion.div>
          ) : generatedImage ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ImageComparison
                originalImage={selectedImage}
                generatedImage={generatedImage}
                generationInfo={generationInfo}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Left Column - Upload & Style */}
              <div className="space-y-6">
                <ImageUpload
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                  onRemove={handleRemoveImage}
                />
                
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onStyleSelect={setSelectedStyle}
                />
              </div>

              {/* Right Column - Prompts & Generate */}
              <div className="space-y-6">
                <div className="glass-card">
                  <h2 className="text-xl font-semibold text-white mb-4 text-shadow">
                    Describe Your Vision
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Prompt *
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="a beautiful landscape with mountains and a lake..."
                        className="glass-input w-full h-24 resize-none"
                        maxLength={1000}
                      />
                      <div className="text-right text-xs text-white/50 mt-1">
                        {prompt.length}/1000
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Negative Prompt (Optional)
                      </label>
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, low quality, distorted..."
                        className="glass-input w-full h-20 resize-none"
                        maxLength={500}
                      />
                      <div className="text-right text-xs text-white/50 mt-1">
                        {negativePrompt.length}/500
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                <ErrorMessage 
                  error={error} 
                  onClose={() => setError(null)} 
                />

                {/* Generate Button */}
                <motion.button
                  whileHover={canGenerate ? { scale: 1.02, y: -2 } : {}}
                  whileTap={canGenerate ? { scale: 0.98 } : {}}
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`
                    w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300
                    ${canGenerate
                      ? 'glass-button bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/30 hover:from-purple-500/40 hover:to-pink-500/40 shadow-lg hover:shadow-xl'
                      : 'glass bg-white/5 text-white/40 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Sparkles className={`w-5 h-5 ${canGenerate ? 'text-yellow-400' : 'text-white/30'}`} />
                    <span>Generate Masterpiece</span>
                    <Zap className={`w-5 h-5 ${canGenerate ? 'text-blue-400' : 'text-white/30'}`} />
                  </div>
                </motion.button>

                {/* Tips */}
                <div className="glass rounded-xl p-4 border-blue-400/20">
                  <h3 className="text-white/80 font-medium text-sm mb-2 flex items-center space-x-2">
                    <span>💡</span>
                    <span>Tips for better results:</span>
                  </h3>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• Use clear, simple sketches with defined shapes</li>
                    <li>• Be specific in your prompt descriptions</li>
                    <li>• Try different styles to find your favorite</li>
                    <li>• Add negative prompts to avoid unwanted elements</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-16 text-white/40 text-sm"
      >
        <p>Powered by Stable Diffusion • Made with ❤️ for creators</p>
      </motion.footer>
    </div>
  );
}

export default App;