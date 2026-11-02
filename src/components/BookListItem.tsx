import { BookOpen, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import type { UserBook } from '../api/types';

interface Props {
  book: UserBook;
  onClick?: () => void;
}

export function BookListItem({ book, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 bg-surface border border-border rounded-xl cursor-pointer hover:shadow-md transition-all"
    >
      {/* Small Cover */}
      <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-bg border border-border relative">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <BookOpen className="w-6 h-6 text-primary/30" />
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
    </div>
  );
}