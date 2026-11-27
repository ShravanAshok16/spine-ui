import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BookOpen, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { UserBook } from '../api/types';
import confetti from 'canvas-confetti';

interface Props {
  book: UserBook;
  onClose: () => void;
}

export function LogSessionModal({ book, onClose }: Props) {
  const [pages, setPages] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (pagesRead: number) => {
      await apiClient.post(`/api/UserBooks/${book.id}/sessions`, { pagesRead });
    },
    onSuccess: () => {
      const newPage = (book.currentPage || 0) + parseInt(pages);
      const isFinished = book.totalPages && newPage >= book.totalPages;

      if (isFinished) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#10b981', '#f59e0b'] });
        toast.success(`Congratulations! You finished "${book.title}"!`, { icon: '🎉' });
      } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        toast.success(`Logged ${pages} pages!`);
      }

      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
      onClose();
    },
    onError: () => toast.error("Failed to log session")
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Stage the focus: Dim the background */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />
        
        {/* Bottom Sheet Animation */}
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-surface border-t border-border rounded-t-3xl shadow-2xl p-6 pb-safe-bottom md:pb-6 md:mb-8 md:rounded-3xl"
        >
          {/* Draggable handle indicator */}
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 md:hidden" />

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-serif font-bold">Log Session</h3>
            <button onClick={onClose} className="p-2 bg-bg rounded-full text-text-muted hover:text-text"><X className="w-5 h-5"/></button>
          </div>
          <p className="text-sm text-text-muted mb-6 line-clamp-1">{book.title}</p>
          
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(parseInt(pages)); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Pages read today</label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-4 focus:ring-primary/15 text-lg font-bold"
                autoFocus
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={!pages || mutation.isPending} 
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />} Save Session
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}