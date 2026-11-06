import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProgress } from '../api/library';
import { toast } from 'sonner';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onClose: () => void;
}

export function UpdateProgressModal({ book, onClose }: Props) {
  const [page, setPage] = useState(book.currentPage.toString());
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPage: number) => updateProgress(book.id, newPage),
    onMutate: async (newPage) => {
      // 🔥 OPTIMISTIC UPDATE: Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['library'] });

      // Snapshot the previous value
      const previousBooks = queryClient.getQueryData<UserBook[]>(['library']);

      // Optimistically update to the new value
      queryClient.setQueryData<UserBook[]>(['library'], (old) => {
        if (!old) return old;
        return old.map((b) =>
          b.id === book.id
            ? { ...b, currentPage: newPage, status: (newPage >= (b.totalPages || 9999)) ? 'Finished' : b.status }
            : b
        );
      });

      return { previousBooks };
    },
    onError: (err, newPage, context) => {
      // Rollback on error
      if (context?.previousBooks) {
        queryClient.setQueryData(['library'], context.previousBooks);
      }
      toast.error('Failed to update progress');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 0) return toast.error('Invalid page number');
    mutation.mutate(pageNum);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6"
        >
          <h3 className="text-xl font-serif font-bold mb-1">Update Progress</h3>
          <p className="text-sm text-text-muted mb-6 line-clamp-1">{book.title}</p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Current Page (of {book.totalPages || '?'})
              </label>
              <input
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-4 focus:ring-primary/15 text-lg font-bold"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Progress
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}