import { useState } from 'react';
import { Plus, Search, Camera, PenLine } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useUI } from '../context/UIContext';

export function FloatingAddButton() {
  const { openAddModal } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide on Scroll
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsVisible(false);
      setIsOpen(false);
    } else {
      setIsVisible(true);
    }
  });

  const actions = [
    { icon: <Search className="w-5 h-5" />, label: 'Search', onClick: () => { setIsOpen(false); openAddModal(); } },
    { icon: <Camera className="w-5 h-5" />, label: 'Scan', onClick: () => { setIsOpen(false); alert('Camera scanner coming in Sprint 14!'); } },
    { icon: <PenLine className="w-5 h-5" />, label: 'Manual', onClick: () => { setIsOpen(false); openAddModal(); } },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 50 }} 
          className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end gap-3"
        >
          <AnimatePresence>
            {isOpen && actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                onClick={action.onClick}
                className="flex items-center gap-3 bg-surface border border-border shadow-lg rounded-full pl-4 pr-2 py-2 hover:bg-bg transition-colors"
              >
                <span className="text-sm font-medium">{action.label}</span>
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-hover transition-colors"
          >
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Plus className="w-6 h-6" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}