import { BookOpen, Bookmark, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserBook } from '../api/types';

interface Props {
  books: UserBook[];
  onReadingClick?: () => void;
}

export function StatsRow({ books, onReadingClick }: Props) {
  const total = books.length;
  const reading = books.filter((b) => b.status === 'Reading').length;
  const finished = books.filter((b) => b.status === 'Finished').length;

  // Average only over books that actually have a page count, so missing data doesn't drag it down
  const booksWithPages = books.filter((b) => (b.totalPages || 0) > 0);
  const avgPages = booksWithPages.length
    ? Math.round(booksWithPages.reduce((sum, b) => sum + (b.totalPages || 0), 0) / booksWithPages.length)
    : 0;

  const stats = [
    { label: 'Total Books', value: total, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Reading', value: reading, icon: Bookmark, color: 'text-primary', bg: 'bg-primary/10', onClick: onReadingClick },
    { label: 'Finished', value: finished, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Avg Pages', value: avgPages, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={stat.onClick}
            className={`bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
              stat.onClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-text">{stat.value}</p>
              <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
