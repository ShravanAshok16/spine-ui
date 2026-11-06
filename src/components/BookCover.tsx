import { useState, type SyntheticEvent, useMemo } from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteUserBook } from '../api/library';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import type { UserBook } from '../api/types';
import { Heart } from 'lucide-react'; // Add this import
import { toggleFavourite } from '../api/library'; // Add this import

interface Props {
  book: UserBook;
  onClick?: () => void;
  index?: number;
}

const statusStyles: Record<string, string> = {
  Reading: 'bg-blue-500/90 text-white',
  Finished: 'bg-green-500/90 text-white',
  Unread: 'bg-gray-500/80 text-white',
  DNF: 'bg-red-500/90 text-white',
};

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
];

export function BookCover({ book, onClick, index = 0 }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const showFallback = !book.coverUrl || imageError;
  
  const queryClient = useQueryClient();
  
  // 🔥 Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteUserBook(book.id),
    onSuccess: () => {
      toast.success('Book removed from library');
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the book details page if we add one later
    if (confirm(`Remove "${book.title}" from your library?`)) {
      deleteMutation.mutate();
    }
  };

  const gradientClass = useMemo(() => {
    const charCode = book.title.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  }, [book.title]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 10) setImageError(true);
    setImageLoading(false);
  };

  const primaryGenre = book.genres?.split(',')[0]?.trim();

  // Inside the component, add this mutation:
const favouriteMutation = useMutation({
  mutationFn: () => toggleFavourite(book.id),
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['library'] });
    const previous = queryClient.getQueryData<UserBook[]>(['library']);
    queryClient.setQueryData<UserBook[]>(['library'], (old) =>
      old?.map(b => b.id === book.id ? { ...b, isFavourite: !b.isFavourite } : b)
    );
    return { previous };
  },
  onError: (err, _, context) => {
    if (context?.previous) queryClient.setQueryData(['library'], context.previous);
    toast.error('Failed to update favourite');
  }
});

const handleFavourite = (e: React.MouseEvent) => {
  e.stopPropagation();
  favouriteMutation.mutate();
};

// Then, inside the cover container (next to the delete button or status badge):
<div className="absolute bottom-2 right-2 z-20">
  <button
    onClick={handleFavourite}
    className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/80 transition-colors"
  >
    <Heart className={`w-4 h-4 ${book.isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
  </button>
</div>

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-3 animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface border border-border shadow-sm transition-all duration-200">
        
        {imageLoading && !showFallback && (
          <div className="absolute inset-0 bg-surface-hover animate-pulse" />
        )}

        {!showFallback && (
          <img
            src={book.coverUrl!}
            alt={book.title}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}

        {showFallback && (
          <div className={cn("absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-br text-white", gradientClass)}>
            <div className="opacity-50">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-serif font-bold text-lg leading-tight line-clamp-4 drop-shadow-md">
                {book.title}
              </h4>
              <p className="text-xs text-white/80 mt-2 line-clamp-2 uppercase tracking-wider font-medium">
                {book.author}
              </p>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest text-right">
              Spine
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm',
            statusStyles[book.status] || statusStyles.Unread
          )}>
            {book.status}
          </span>
        </div>

        {/* 🔥 Delete Button (Visible on Hover) */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-black/60 hover:bg-red-500 backdrop-blur-sm p-1.5 rounded-full text-white transition-colors"
            title="Remove from library"
          >
            {deleteMutation.isPending ? (
              <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Genre Chip */}
        {primaryGenre && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
              {primaryGenre}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {book.status === 'Reading' && book.totalPages && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-text-muted mt-1 line-clamp-1">{book.author}</p>
      </div>
    </motion.div>
  );
}