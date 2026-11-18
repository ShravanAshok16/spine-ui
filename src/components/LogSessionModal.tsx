import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onClose: () => void;
}

// 🔥 FIX: Ensure this is a NAMED export
export function LogSessionModal({ book, onClose }: Props) {
  const [pages, setPages] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (pagesRead: number) => {
      await apiClient.post(`/api/UserBooks/${book.id}/sessions`, { pagesRead });
    },
    onSuccess: () => {
      toast.success(`Logged ${pages} pages!`);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
      onClose();
    },
    onError: () => toast.error("Failed to log session")
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-serif font-bold mb-1">Log Session</h3>
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
            <button type="submit" disabled={!pages || mutation.isPending} className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />} Save Session
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}