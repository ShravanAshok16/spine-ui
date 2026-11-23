import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookReviews, submitReview } from '../api/reviews';
import { StarRating } from './StarRating';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReviewsSection({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => getBookReviews(bookId),
  });

  const mutation = useMutation({
    mutationFn: () => submitReview(bookId, { rating, reviewText: text }),
    onSuccess: () => {
      toast.success('Review submitted!');
      setRating(0);
      setText('');
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit review'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const { averageRating = 0, totalReviews = 0, reviews = [] } = data || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 bg-surface border border-border rounded-2xl p-5">
        <div className="text-4xl font-bold font-serif">{averageRating.toFixed(1)}</div>
        <div>
          <StarRating rating={Math.round(averageRating)} readonly size="sm" />
          <p className="text-xs text-text-muted mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-serif font-bold text-lg mb-4">Write a Review</h3>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you think of this book?"
          className="w-full mt-4 p-4 rounded-xl border border-border bg-bg focus:ring-4 focus:ring-primary/15 resize-none h-24"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={rating === 0 || mutation.isPending}
          className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-text-muted py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{review.userDisplayName}</span>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              {review.reviewText && <p className="text-sm text-text-muted leading-relaxed">{review.reviewText}</p>}
              <p className="text-xs text-text-muted mt-3">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}