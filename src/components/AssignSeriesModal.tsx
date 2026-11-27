import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Layers } from 'lucide-react';
import { apiClient } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedBookIds: string[];
  existingSeries: string[];
  onSuccess?: () => void; // 🔥 Added this
}

export function AssignSeriesModal({ isOpen, onClose, selectedBookIds, existingSeries, onSuccess }: Props) {
  const [seriesName, setSeriesName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesName.trim()) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedBookIds.map((id) =>
          apiClient.put(`/api/UserBooks/${id}`, { seriesName: seriesName.trim() })
        )
      );
      
      toast.success(`Added ${selectedBookIds.length} books to "${seriesName}"`);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onSuccess?.(); // 🔥 Trigger clear selection
      onClose();
      setSeriesName('');
    } catch (err) {
      toast.error('Failed to update series');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-text flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Assign to Series
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-full text-text-muted"><X className="w-5 h-5" /></button>
          </div>
          
          <p className="text-sm text-text-muted mb-6">
            Assigning {selectedBookIds.length} book{selectedBookIds.length > 1 ? 's' : ''} to a series.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Series Name</label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                placeholder="e.g. The Stormlight Archive"
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-4 focus:ring-primary/15 focus:border-primary"
                autoFocus
              />
            </div>

            {existingSeries.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Or select existing:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {existingSeries.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeriesName(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${seriesName === s ? 'bg-primary text-white border-primary' : 'bg-bg border-border hover:border-primary/50 text-text'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!seriesName.trim() || isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50 mt-6"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save to Series'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}