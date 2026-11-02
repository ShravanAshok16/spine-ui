import { Book, BookOpen, CheckCircle, Flame } from 'lucide-react';
import type { UserBook } from '../api/types';

export function StatsRow({ books }: { books: UserBook[] }) {
  const total = books.length;
  const reading = books.filter((b) => b.status === 'Reading').length;
  const finished = books.filter((b) => b.status === 'Finished').length;

  const stats = [
    { label: 'Total Books', value: total, icon: Book, color: 'text-primary' },
    { label: 'Reading', value: reading, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Finished', value: finished, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Streak', value: '0 days', icon: Flame, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg bg-bg flex items-center justify-center ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}