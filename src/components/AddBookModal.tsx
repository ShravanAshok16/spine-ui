import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookPlus, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'isbn' | 'manual'>('isbn');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // ISBN Form State
  const [isbn, setIsbn] = useState('');

  // Manual Form State
  const [manualData, setManualData] = useState({
    title: '',
    author: '',
    language: 'en',
    pageCount: '',
    genres: '',
  });

  const handleIsbnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbn.trim()) return;
    
    setIsLoading(true);
    try {
      await apiClient.post('/api/UserBooks', { isbn, status: 'Unread' });
      toast.success('Book added to library!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
      setIsbn('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to find book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/api/UserBooks/manual', {
        ...manualData,
        pageCount: manualData.pageCount ? parseInt(manualData.pageCount) : null,
      });
      toast.success('Book added manually!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
      setManualData({ title: '', author: '', language: 'en', pageCount: '', genres: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal Container (scroll-padding-bottom fixes mobile keyboard) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none scroll-padding-bottom-[20vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-serif font-bold">Add a Book</h2>
                <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-6 pt-4 border-b border-border">
                <button
                  onClick={() => setActiveTab('isbn')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'isbn' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
                  }`}
                >
                  Scan/Enter ISBN
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`ml-6 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
                  }`}
                >
                  Manual Entry
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {activeTab === 'isbn' ? (
                  <form onSubmit={handleIsbnSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">ISBN Number</label>
                      <input
                        type="text"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="e.g. 9780547928227"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-bg transition-all"
                        required
                      />
                      <p className="text-xs text-text-muted mt-2">
                        We will automatically fetch the title, author, and cover.
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !isbn.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium shadow-sm hover:bg-primary-hover transition-all disabled:opacity-50 mt-4"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      {isLoading ? 'Searching...' : 'Search & Add'}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1.5">Title</label>
                          <input type="text" required value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                       </div>
                       <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1.5">Author</label>
                          <input type="text" required value={manualData.author} onChange={e => setManualData({...manualData, author: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium mb-1.5">Language</label>
                          <select value={manualData.language} onChange={e => setManualData({...manualData, language: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                            <option value="en">English</option>
                            <option value="kn">Kannada</option>
                            <option value="te">Telugu</option>
                            <option value="ta">Tamil</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-medium mb-1.5">Pages</label>
                          <input type="number" value={manualData.pageCount} onChange={e => setManualData({...manualData, pageCount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                       </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium shadow-sm hover:bg-primary-hover transition-all disabled:opacity-50 mt-4"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookPlus className="w-5 h-5" />}
                      {isLoading ? 'Adding...' : 'Add to Library'}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}