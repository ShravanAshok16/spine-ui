import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenLine } from 'lucide-react';
import type { UserBook } from '../api/types';
import { LogSessionModal } from './LogSessionModal';

export function ContinueReadingCard({ book }: { book: UserBook }) {
  const navigate = useNavigate();
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  
  const progress = book.totalPages ? Math.min(100, ((book.currentPage || 0) / book.totalPages) * 100) : 0;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-surface border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="w-24 h-36 md:w-32 md:h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center"><BookOpen className="w-8 h-8 text-primary/40" /></div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left min-w-0 w-full">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Continue Reading</p>
          <h3 className="text-2xl font-serif font-bold text-text truncate">{book.title}</h3>
          <p className="text-sm text-text-muted mt-1">{book.author}</p>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-text-muted">Page {book.currentPage || 0} of {book.totalPages || '?'}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-bg rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setIsLogSessionOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
            >
              <PenLine className="w-4 h-4" /> Log Session
            </button>
            <button 
              onClick={() => navigate(`/books/${book.id}`)}
              className="flex-1 md:flex-none bg-surface border border-border text-text px-6 py-3 rounded-xl font-medium hover:border-primary transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </motion.div>

      {isLogSessionOpen && (
        <LogSessionModal book={book} onClose={() => setIsLogSessionOpen(false)} />
      )}
    </>
  );
}