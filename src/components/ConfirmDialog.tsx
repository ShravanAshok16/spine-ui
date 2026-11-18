import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({ isOpen, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, isDestructive = true }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onCancel} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6 pointer-events-auto text-center"
            >
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-text mb-2">{title}</h3>
              <p className="text-sm text-text-muted mb-6">{description}</p>
              
              <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-bg transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={onConfirm} 
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${
                    isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}