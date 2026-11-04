import { useState } from 'react';
import { ChevronDown, ChevronRight, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserBook } from '../api/types';
import { BookCover } from './BookCover';

export function SeriesGroup({ seriesName, books }: { seriesName: string; books: UserBook[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 bg-surface/50 border border-border rounded-xl p-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 w-full text-left">
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        <Library className="w-5 h-5 text-primary" />
        <h3 className="font-serif font-bold text-lg">{seriesName}</h3>
        <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded-full ml-2">{books.length} books</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-6 pb-2">
              {books.map((book, i) => <BookCover key={book.id} book={book} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}