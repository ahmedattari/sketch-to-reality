import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card border-red-400/30 bg-red-500/10 mb-6"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="text-red-300 font-medium text-sm">
            Generation Failed
          </h3>
          <p className="text-red-200/80 text-sm mt-1">
            {error}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorMessage;