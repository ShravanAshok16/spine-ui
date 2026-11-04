import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Plus, Check, BookOpen } from 'lucide-react';
import { apiClient } from '../api/client';
import { searchExternalBooks } from '../api/library';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { BookSearchResult } from '../api/types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Manual Entry State
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({ 
    title: '', author: '', language: 'en', pageCount: '', 
    genres: '', description: '', seriesName: '', seriesPosition: '' 
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) {
      setQuery(''); setResults([]); setSelectedIds(new Set()); setHasSearched(false); setIsManualMode(false);
      setManualData({ title: '', author: '', language: 'en', pageCount: '', genres: '', description: '', seriesName: '', seriesPosition: '' });
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (/^\d{10}(\d{3})?$/.test(query.trim())) {
      handleAddIsbnDirectly();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchExternalBooks(query);
      setResults(data);
    } catch { toast.error('Failed to search books'); } 
    finally { setIsSearching(false); }
  };

  const handleAddIsbnDirectly = async () => {
    setIsAdding(true);
    try {
      await apiClient.post('/api/UserBooks', { isbn: query.trim(), status: 'Unread' });
      toast.success('Book added successfully!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
    } catch (err: any) { toast.error(err.message || 'Failed to find book by ISBN'); } 
    finally { setIsAdding(false); }
  };

  const toggleSelection = (book: BookSearchResult) => {
    const id = book.isbn || `${book.title}-${book.author}`;
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAddSelected = async () => {
    setIsAdding(true);
    try {
      const booksToAdd = results.filter(b => selectedIds.has(b.isbn || `${b.title}-${b.author}`));
      await Promise.all(booksToAdd.map(book => 
        apiClient.post('/api/UserBooks/manual', {
          title: book.title, author: book.author, isbn: book.isbn, description: book.description,
          pageCount: book.pageCount, genres: book.genres, language: book.language, 
          coverUrl: book.coverUrl, seriesName: book.seriesName, seriesPosition: book.seriesPosition 
        })
      ));
      toast.success(`${booksToAdd.length} book${booksToAdd.length > 1 ? 's' : ''} added!`);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
    } catch (err: any) { toast.error(err.message || 'Failed to add some books'); } 
    finally { setIsAdding(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await apiClient.post('/api/UserBooks/manual', { 
        ...manualData, 
        pageCount: manualData.pageCount ? parseInt(manualData.pageCount) : null,
        seriesPosition: manualData.seriesPosition ? parseInt(manualData.seriesPosition) : null
      });
      toast.success('Book added manually!');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      onClose();
    } catch (err: any) { toast.error(err.message || 'Failed to add book'); } 
    finally { setIsAdding(false); }
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">{isManualMode ? 'Add Book Manually' : 'Add a Book'}</h2>
                <div className="flex items-center gap-2">
                  {isManualMode && <button onClick={() => setIsManualMode(false)} className="text-sm text-primary hover:underline">Back to Search</button>}
                  <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
                </div>
              </div>

              {!isManualMode && (
                <div className="p-6 border-b border-border bg-bg/50">
                  <form onSubmit={handleSearch} className="relative group flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ISBN, Title, or Author..." className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all text-base" autoFocus />
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSearching || !query.trim()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </motion.button>
                  </form>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 relative">
                {isManualMode && (
                  <form onSubmit={handleManualSubmit} className="space-y-4 max-w-lg mx-auto">
                    <div><label className="block text-sm font-medium mb-1.5">Title</label><input type="text" required value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg" /></div>
                    <div><label className="block text-sm font-medium mb-1.5">Author</label><input type="text" required value={manualData.author} onChange={e => setManualData({...manualData, author: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg" /></div>
                    
                    {/* 🔥 SERIES FIELDS ADDED HERE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1.5">Series Name (Optional)</label><input type="text" value={manualData.seriesName} onChange={e => setManualData({...manualData, seriesName: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg" placeholder="e.g. The Inheritance Cycle" /></div>
                      <div><label className="block text-sm font-medium mb-1.5">Book # in Series</label><input type="number" value={manualData.seriesPosition} onChange={e => setManualData({...manualData, seriesPosition: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg" placeholder="e.g. 2" /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1.5">Language</label><select value={manualData.language} onChange={e => setManualData({...manualData, language: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg"><option value="en">English</option><option value="kn">Kannada</option><option value="te">Telugu</option><option value="ta">Tamil</option></select></div>
                      <div><label className="block text-sm font-medium mb-1.5">Pages</label><input type="number" value={manualData.pageCount} onChange={e => setManualData({...manualData, pageCount: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl bg-bg" /></div>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isAdding} className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-4 flex justify-center items-center gap-2">
                       {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Add to Library
                    </motion.button>
                  </form>
                )}

                {!isManualMode && results.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                    {results.map((book, i) => {
                      const id = book.isbn || `${book.title}-${book.author}`;
                      const isSelected = selectedIds.has(id);
                      return (
                        <div key={i} onClick={() => toggleSelection(book)} className={cn("group cursor-pointer border rounded-lg overflow-hidden transition-all bg-bg flex flex-col relative", isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/50")}>
                          <div className="aspect-[2/3] w-full relative bg-surface">
                            {book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center bg-primary/10 p-2 text-center"><span className="text-xs text-text-muted">{book.title}</span></div>}
                            <div className={cn("absolute inset-0 flex items-center justify-center transition-colors", isSelected ? "bg-primary/20" : "bg-transparent group-hover:bg-black/10")}>
                              {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-primary text-white rounded-full p-2 shadow-lg"><Check className="w-5 h-5" /></motion.div>}
                            </div>
                          </div>
                          <div className="p-3"><h4 className="font-serif font-semibold text-sm line-clamp-1">{book.title}</h4><p className="text-xs text-text-muted line-clamp-1 mt-1">{book.author}</p></div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isManualMode && hasSearched && !isSearching && results.length === 0 && (
                  <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 text-text-muted/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No results found</h3>
                    <p className="text-sm text-text-muted mb-6">We couldn't find "{query}" in our database.</p>
                    <button onClick={() => { setManualData({...manualData, title: query}); setIsManualMode(true); }} className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-medium hover:bg-primary/20 transition-colors">Add Manually</button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-border shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] flex items-center justify-between">
                    <span className="text-sm font-medium ml-2">{selectedIds.size} books selected</span>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddSelected} disabled={isAdding} className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-hover flex items-center gap-2">
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add {selectedIds.size} Book{selectedIds.size > 1 ? 's' : ''}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}