import { useQuery } from '@tanstack/react-query';
import { getDailyQuote } from '../api/quotes';
import { Quote as QuoteIcon } from 'lucide-react';

export function QuoteCard() {
  const { data: quote, isLoading } = useQuery({
    queryKey: ['daily-quote'],
    queryFn: getDailyQuote,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  if (isLoading || !quote) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden group hover:shadow-md transition-all">
      <QuoteIcon className="absolute top-4 right-4 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      <p className="font-serif italic text-lg text-text relative z-10">"{quote.text}"</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-medium text-primary">— {quote.author}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider">Quote of the Day</span>
      </div>
    </div>
  );
}