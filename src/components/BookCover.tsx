import { useState, type SyntheticEvent, useMemo } from 'react';
import { BookOpen, Trash2, Heart, MoreVertical, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toggleFavourite } from '../api/library';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import type { UserBook } from '../api/types';
import { LanguageBadge } from './LanguageBadge';

interface Props {
  book: UserBook;
  onClick?: () => void;
  index?: number;
  onRequestDelete?: (id: string, title: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isSelectionMode?: boolean;
}

const statusStyles: Record<string, string> = {
  Reading: 'bg-blue-500/90 text-white',
  Paused: 'bg-amber-500/90 text-white',
  Finished: 'bg-green-500/90 text-white',
  Unread: 'bg-gray-500/80 text-white',
  DNF: 'bg-red-500/90 text-white',
};

const gradients = [
  'from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-cyan-600',
];

export function BookCover({ book, onClick, index = 0, onRequestDelete, isSelected, onToggleSelect, isSelectionMode }: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const showFallback = !book.coverUrl || imageError;
  
  const queryClient = useQueryClient();
  
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      onToggleSelect?.();
    } else if (onClick) {
      // 🔥 FIX: Explicitly call onClick
      onClick();
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  };

  const handleFavourite = (e: React.MouseEvent) => {
    e.stopPropagation();
    favouriteMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onRequestDelete) onRequestDelete(book.id, book.title);
  };

  const gradientClass = useMemo(() => {
    const charCode = book.title.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  }, [book.title]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 10) setImageError(true);
    setImageLoading(false);
  };

  return (
    <motion.div
      layout="position"
      whileHover={{ 
        y: isSelectionMode ? 0 : -8, 
        scale: isSelectionMode ? 1 : 1.03,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick} // 🔥 Attached here
      className={cn("group cursor-pointer flex flex-col gap-3 animate-fade-up relative", isSelectionMode && "select-none")}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={cn(
        "relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface border transition-all duration-300",
        "shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/10",
        isSelected 
          ? "border-primary ring-2 ring-primary/30" 
          : "border-border/60 group-hover:border-primary/40"
      )}>
        
        {isSelectionMode && (
          <div className="absolute top-2 left-2 z-30">
            <button 
              onClick={handleSelect}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected ? "bg-primary border-primary text-white scale-110 shadow-md" : "bg-black/40 border-white/70 text-transparent backdrop-blur-sm"
              )}
            >
              <Check className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        )}

        {imageLoading && !showFallback && (
          <div className="absolute inset-0 bg-surface-hover animate-pulse" />
        )}

        {!showFallback && (
          <img
            src={book.coverUrl!}
            alt={book.title}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
            className={cn('w-full h-full object-cover transition-opacity duration-300', imageLoading ? 'opacity-0' : 'opacity-100', isSelected && 'brightness-75')}
          />
        )}

        {showFallback && (
          <div className={cn("absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-br text-white", gradientClass, isSelected && 'brightness-75')}>
            <div className="opacity-50"><BookOpen className="w-6 h-6" /></div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-serif font-bold text-lg leading-tight line-clamp-4 drop-shadow-md">{book.title}</h4>
              <p className="text-xs text-white/80 mt-2 line-clamp-2 uppercase tracking-wider font-medium">{book.author}</p>
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest text-right">Spine</div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-10">
          <LanguageBadge code={book.language} size="sm" />
        </div>

        {book.status && !isSelectionMode && (
          <div className="absolute top-2 right-2">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider shadow-sm', statusStyles[book.status] || statusStyles.Unread)}>
              {book.status}
            </span>
          </div>
        )}

        {book.status && !isSelectionMode && (
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleFavourite} className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/80 transition-colors">
              <Heart className={cn("w-4 h-4 transition-colors", book.isFavourite ? 'fill-red-500 text-red-500' : '')} />
            </button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/80 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute bottom-full right-0 mb-2 w-32 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {book.status === 'Reading' && book.totalPages && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col px-0.5">
        <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
        <p className="text-xs text-text-muted mt-1 line-clamp-1">{book.author}</p>
        {book.personalRating ? (
          <div className="flex items-center gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn("w-3 h-3", star <= (book.personalRating || 0) ? "fill-yellow-500 text-yellow-500" : "fill-transparent text-gray-400 dark:text-gray-600")} />
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}