import { useQuery } from '@tanstack/react-query';
import { getRandomQuote } from '../api/quotes';
import { Quote as QuoteIcon } from 'lucide-react';

export function QuoteCard() {
  const { data: quote, isLoading } = useQuery({
    queryKey: ['random-quote'],
    queryFn: getRandomQuote,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });

  if (isLoading || !quote) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden">
      <QuoteIcon className="absolute top-4 right-4 w-12 h-12 text-primary/10" />
      <p className="font-serif italic text-lg text-text relative z-10">"{quote.text}"</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-medium text-primary">— {quote.bookTitle}</span>
        <span className="text-text-muted text-xs">Page {quote.pageNumber}</span>
      </div>
    </div>
  );
}