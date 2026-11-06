import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { linkSeries } from '../api/library';
import { toast } from 'sonner';
import type { UserBook } from '../api/types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableBooks: UserBook[];
}

export function CreateSeriesModal({ isOpen, onClose, availableBooks }: Props) {
  const [seriesName, setSeriesName] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const filteredBooks = availableBooks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBook = (bookId: string) => {
    const newSet = new Set(selectedBookIds);
    if (newSet.has(bookId)) newSet.delete(bookId);
    else newSet.add(bookId);
    setSelectedBookIds(newSet);
  };

  const handleSave = async () => {
    if (!seriesName.trim()) return toast.error('Please enter a series name');
    if (selectedBookIds.size === 0) return toast.error('Please select at least one book');

    setIsSaving(true);
    try {
      await linkSeries(seriesName.trim(), Array.from(selectedBookIds));
      toast.success('Series created successfully!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
      setSeriesName('');
      setSelectedBookIds(new Set());
      setSearch('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create series');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Create a Series</h2>
                <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Series Name</label>
                  <input
                    type="text"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="e.g. The Stormlight Archive"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Select Books</label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search your library..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] p-1">
                    {filteredBooks.map(book => {
                      const isSelected = selectedBookIds.has(book.bookId); // Use bookId to link to the global catalog book
                      return (
                        <div 
                          key={book.id} 
                          onClick={() => toggleBook(book.bookId)}
                          className={cn(
                            "cursor-pointer border rounded-lg p-3 flex flex-col gap-2 transition-all",
                            isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/50 bg-bg"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate pr-2">{book.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </div>
                          <span className="text-[10px] text-text-muted truncate">{book.author}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-bg transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create & Link
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}