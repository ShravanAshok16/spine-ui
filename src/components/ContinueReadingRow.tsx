import { BookOpen, ChevronRight } from 'lucide-react';
import type { UserBook } from '../api/types';
import { Link } from 'react-router-dom';

interface Props {
  books: UserBook[];
}

export function ContinueReadingRow({ books }: Props) {
  if (books.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-bold">Continue Reading</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {books.map((book) => {
          const progress = book.totalPages ? Math.min(100, (book.currentPage / book.totalPages) * 100) : 0;
          return (
            <Link 
              to={`/books/${book.id}`} 
              key={book.id}
              className="flex-shrink-0 w-64 bg-surface border border-border rounded-xl p-4 flex gap-4 hover:shadow-md transition-all snap-start"
            >
              <div className="w-16 h-24 rounded bg-bg border border-border overflow-hidden flex-shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-serif font-semibold text-sm line-clamp-2 leading-tight">{book.title}</h3>
                <p className="text-xs text-text-muted truncate mt-1">{book.author}</p>
                <div className="mt-2">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">Page {book.currentPage} of {book.totalPages}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}