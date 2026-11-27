import { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCover } from './BookCover';
import type { UserBook } from '../api/types';

interface Props {
  seriesName: string;
  books: UserBook[];
  isSelectionMode?: boolean;
  selectedBooks?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRequestDelete?: (id: string, title: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdateOwnership?: (id: string, ownership: string) => void; // 🔥 Added
}

export function SeriesGroup({ 
  seriesName, 
  books, 
  isSelectionMode, 
  selectedBooks, 
  onToggleSelect, 
  onRequestDelete,
  onUpdateStatus,
  onUpdateOwnership
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-5 h-5 text-text-muted" /> : <ChevronRight className="w-5 h-5 text-text-muted" />}
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-serif font-bold text-text">{seriesName}</h3>
          <span className="text-xs font-medium bg-bg px-2.5 py-1 rounded-full text-text-muted border border-border">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map((book, index) => (
                <BookCover
                  key={book.id}
                  book={book}
                  index={index}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedBooks?.has(book.id)}
                  onToggleSelect={() => onToggleSelect?.(book.id)}
                  onRequestDelete={onRequestDelete}
                  onUpdateStatus={onUpdateStatus}
                  onUpdateOwnership={onUpdateOwnership} // 🔥 Passed down
                  onClick={() => !isSelectionMode && (window.location.href = `/books/${book.id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}