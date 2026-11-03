import { Book, BookOpen, CheckCircle, Flame, FileText } from 'lucide-react';
import type { UserBook } from '../api/types';

interface Props {
  books: UserBook[];
  onReadingClick?: () => void;
}

export function StatsRow({ books, onReadingClick }: Props) {
  const total = books.length;
  const reading = books.filter((b) => b.status === 'Reading').length;
  const finished = books.filter((b) => b.status === 'Finished').length;
  
  // Calculate Average Pages
  const booksWithPages = books.filter(b => b.totalPages && b.totalPages > 0);
  const avgPages = booksWithPages.length > 0 
    ? Math.round(booksWithPages.reduce((sum, b) => sum + (b.totalPages || 0), 0) / booksWithPages.length)
    : 0;

  const stats = [
    { label: 'Total Books', value: total, icon: Book, color: 'text-primary' },
    { label: 'Reading', value: reading, icon: BookOpen, color: 'text-blue-500', onClick: onReadingClick },
    { label: 'Finished', value: finished, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Avg Pages', value: avgPages, icon: FileText, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <button
            key={stat.label}
            onClick={stat.onClick}
            disabled={!stat.onClick}
            className={`bg-surface border border-border rounded-xl p-4 flex items-center gap-3 text-left transition-all ${
              stat.onClick ? 'hover:shadow-md hover:border-primary/40 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg bg-bg flex items-center justify-center ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}