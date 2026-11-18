import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface Props {
  rating: number | null | undefined;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating = 0, onRatingChange, readonly = false, size = 'md' }: Props) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : (rating || 0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          whileHover={readonly ? {} : { scale: 1.2 }}
          whileTap={readonly ? {} : { scale: 0.9 }}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(null)}
          onClick={() => !readonly && onRatingChange?.(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayRating
                ? "fill-yellow-500 text-yellow-500"
                : "fill-transparent text-gray-400 dark:text-gray-600"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}