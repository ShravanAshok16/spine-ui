import { BookOpen, Bookmark, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserBook } from '../api/types';

interface Props {
  books: UserBook[];
  onReadingClick?: () => void;
}

export function StatsRow({ books, onReadingClick }: Props) {
  const total = books.length;
  const reading = books.filter(b => b.status === 'Reading').length;
  const finished = books.filter(b => b.status === 'Finished').length;
  const totalPages = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);

  const stats = [
    { label: 'Total Books', value: total, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Reading', value: reading, icon: Bookmark, color: 'text-primary', bg: 'bg-primary/10', onClick: onReadingClick },
    { label: 'Finished', value: finished, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Avg Pages', value: totalPages ? Math.round(totalPages / (total || 1)) : 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    // 🔥 Grid is 2 columns on mobile, 4 on desktop
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={stat.onClick}
            className={`bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${stat.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${stat.bg}`}>
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-serif font-bold text-text">{stat.value}</p>
              <p className="text-[10px] md:text-xs font-medium text-text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}