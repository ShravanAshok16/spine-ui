import { useState, useMemo, type SyntheticEvent } from 'react';
import { BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onClick?: () => void;
}

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
];

export function BookListItem({ book, onClick }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const showFallback = !book.coverUrl || imageError;

  const gradientClass = useMemo(() => {
    const charCode = book.title.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  }, [book.title]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 10) setImageError(true);
    setImageLoading(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group flex items-center gap-4 p-4 bg-surface border border-border rounded-xl cursor-pointer hover:shadow-md transition-all"
    >
      {/* Cover Container */}
      <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-surface border border-border relative">
        {imageLoading && !showFallback && (
          <div className="absolute inset-0 bg-surface-hover animate-pulse" />
        )}

        {!showFallback && (
          <img
            src={book.coverUrl!}
            alt={book.title}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}

        {showFallback && (
          <div className={cn("absolute inset-0 flex flex-col justify-between p-1.5 bg-gradient-to-br text-white", gradientClass)}>
            <BookOpen className="w-3 h-3 opacity-50" />
            <p className="text-[8px] font-serif font-bold leading-tight line-clamp-3">
              {book.title}
            </p>
            <p className="text-[6px] text-white/70 uppercase line-clamp-1">
              {book.author}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-serif font-semibold text-base text-text truncate group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-text-muted truncate mt-0.5">{book.author}</p>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
          <span className={cn(
            "px-2 py-0.5 rounded-full font-medium",
            book.status === 'Reading' ? "bg-blue-500/10 text-blue-500" :
            book.status === 'Finished' ? "bg-green-500/10 text-green-500" :
            "bg-gray-500/10 text-gray-500"
          )}>
            {book.status}
          </span>
          {book.personalRating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              {book.personalRating}
            </span>
          )}
          {book.totalPages && book.status === 'Reading' && (
            <span>Page {book.currentPage} of {book.totalPages}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}