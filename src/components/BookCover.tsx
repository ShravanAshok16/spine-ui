import { useState, type SyntheticEvent } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onClick?: () => void;
  index?: number;
}

const statusStyles: Record<string, string> = {
  Reading: 'bg-blue-500/90 text-white',
  Finished: 'bg-green-500/90 text-white',
  Unread: 'bg-gray-500/80 text-white',
  DNF: 'bg-red-500/90 text-white',
};

export function BookCover({ book, onClick, index = 0 }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const showFallback = !book.coverUrl || imageError;

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 10) setImageError(true);
    setImageLoading(false);
  };

  // Extract first genre for the chip
  const primaryGenre = book.genres?.split(',')[0]?.trim();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-3 animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface border border-border shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-primary/10">
            <BookOpen className="w-8 h-8 text-primary/40 mb-2" />
            <p className="text-xs text-center text-text-muted font-serif line-clamp-3">
              {book.title}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm',
              statusStyles[book.status] || statusStyles.Unread
            )}
          >
            {book.status}
          </span>
        </div>

        {/* Genre Chip */}
        {primaryGenre && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
              {primaryGenre}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {book.status === 'Reading' && book.totalPages && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-text-muted mt-1 line-clamp-1">{book.author}</p>
      </div>
    </div>
  );
}