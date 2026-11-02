import { BookOpen, ArrowRight } from 'lucide-react';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onLogProgress: () => void;
}

export function ContinueReadingBanner({ book, onLogProgress }: Props) {
  const progress = book.totalPages
    ? Math.min(100, (book.currentPage / book.totalPages) * 100)
    : 0;

  const pagesLeft = book.totalPages ? book.totalPages - book.currentPage : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Cover */}
        <div className="w-20 h-30 md:w-24 md:h-36 flex-shrink-0 rounded-lg overflow-hidden bg-surface border border-border shadow-md">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary/40" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
            Continue Reading
          </p>
          <h2 className="text-xl md:text-2xl font-serif font-bold line-clamp-2 mb-1">
            {book.title}
          </h2>
          <p className="text-sm text-text-muted mb-3">{book.author}</p>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span>Page {book.currentPage}{book.totalPages ? ` of ${book.totalPages}` : ''}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {pagesLeft !== null && (
              <p className="text-xs text-text-muted mt-1.5">
                {pagesLeft} pages to go
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          <button
            onClick={onLogProgress}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            Log Progress <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}