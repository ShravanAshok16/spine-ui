import { useState, useEffect, useRef, type SyntheticEvent, useMemo } from 'react';
import { BookOpen, Trash2, Heart, MoreVertical, Star, ArrowUpRight, DollarSign, Gift } from 'lucide-react';
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
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdateOwnership?: (id: string, ownership: string) => void;
}

const statusStyles: Record<string, string> = {
  Reading: 'bg-blue-500/90 text-white',
  Paused: 'bg-amber-500/90 text-white',
  Finished: 'bg-emerald-500/90 text-white',
  Unread: 'bg-zinc-500/80 text-white',
  DNF: 'bg-red-500/90 text-white',
};

const statusOptions = ['Unread', 'Reading', 'Paused', 'Finished', 'DNF'];
const ownershipOptions = [
  { value: 'Owned', label: 'Owned' },
  { value: 'Wishlist', label: 'Wishlist' },
  { value: 'LentOut', label: 'Lent Out' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Donated', label: 'Donated' },
];

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
];

export function BookCover({
  book,
  onClick,
  index = 0,
  onRequestDelete,
  onUpdateStatus,
  onUpdateOwnership,
  isSelected,
  onToggleSelect,
  isSelectionMode,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); 

  const showFallback = !book.coverUrl || imageError;
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const favouriteMutation = useMutation({
    mutationFn: () => toggleFavourite(book.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['library'] });
      const previous = queryClient.getQueryData(['library']);
      queryClient.setQueryData(['library'], (old: any) =>
        old?.map((b: any) =>
          b.id === book.id ? { ...b, isFavourite: !b.isFavourite } : b
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['library'], context.previous);
      }
      toast.error('Failed to update favourite');
    },
  });

  const handleCardClick = () => {
    if (isSelectionMode) onToggleSelect?.();
    else if (onClick) onClick();
  };

  const handleFavourite = (e: React.MouseEvent) => {
    e.stopPropagation();
    favouriteMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onRequestDelete?.(book.id, book.title);
  };

  const handleStatusChange = (status: string) => {
    onUpdateStatus?.(book.id, status);
    setShowMenu(false);
  };

  const handleOwnershipChange = (ownership: string) => {
    onUpdateOwnership?.(book.id, ownership);
    setShowMenu(false); 
  };

  const gradientClass = useMemo(() => {
    const charCode = book.title.charCodeAt(0) || 0;
    return gradients[charCode % gradients.length];
  }, [book.title]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 10) setImageError(true);
    setImageLoading(false);
  };

  // 🔥 FIX: Wrapped icons in a span to allow the HTML title attribute without TS errors
  const renderOwnershipIcon = () => {
    if (book.ownership === 'Wishlist') return <span title="Wishlist"><Heart className="w-3 h-3 text-pink-500 fill-pink-500" /></span>;
    if (book.ownership === 'LentOut') return <span title="Lent Out"><ArrowUpRight className="w-3 h-3 text-orange-500" /></span>;
    if (book.ownership === 'Sold') return <span title="Sold"><DollarSign className="w-3 h-3 text-green-500" /></span>;
    if (book.ownership === 'Donated') return <span title="Donated"><Gift className="w-3 h-3 text-blue-500" /></span>;
    return null;
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group cursor-pointer flex flex-col gap-3 relative',
        isSelectionMode && 'select-none'
      )}
    >
      <motion.div
        whileHover={isSelectionMode ? {} : { y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={cn(
          'relative aspect-[2/3] w-full rounded-2xl bg-surface border transition-all duration-300',
          'shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10',
          isSelected
            ? 'border-primary ring-2 ring-primary/30 shadow-lg'
            : 'border-border/70 group-hover:border-primary/40'
        )}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {imageLoading && !showFallback && (
            <div className="absolute inset-0 bg-border/40 animate-pulse" />
          )}

          {!showFallback && (
            <img
              src={book.coverUrl!}
              alt={book.title}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                imageLoading ? 'opacity-0' : 'opacity-100',
                isSelected && 'brightness-75'
              )}
            />
          )}

          {showFallback && (
            <div className={cn('absolute inset-0 flex flex-col justify-between p-4 text-white bg-gradient-to-br', gradientClass)}>
              <div className="opacity-50"><BookOpen className="w-6 h-6" /></div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-serif font-bold text-lg leading-tight line-clamp-4">{book.title}</h4>
                <p className="text-xs text-white/80 mt-2 line-clamp-2 uppercase tracking-wider">{book.author}</p>
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest text-right">Spine</div>
            </div>
          )}

          {book.status === 'Reading' && book.totalPages && book.totalPages > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, ((book.currentPage || 0) / book.totalPages) * 100)}%` }} />
            </div>
          )}
        </div>

        {isSelectionMode && (
          <div className="absolute top-2.5 left-2.5 z-30">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected ? 'bg-primary border-primary text-white scale-110 shadow-md' : 'bg-black/40 border-white/70 text-transparent backdrop-blur-sm'
              )}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
          <LanguageBadge code={book.language || 'en'} size="sm" />
        </div>

        {book.status && !isSelectionMode && (
          <div className="absolute top-2.5 right-2.5 pointer-events-none">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider', statusStyles[book.status] || statusStyles.Unread)}>
              {book.status}
            </span>
          </div>
        )}

        {!isSelectionMode && (
          <div className={cn("absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 transition-opacity duration-200", showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <button onClick={handleFavourite} className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/80 transition-colors">
              <Heart className={cn('w-4 h-4 transition-colors', book.isFavourite ? 'fill-red-500 text-red-500' : '')} />
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={(e) => { e.stopPropagation(); setShowMenu((prev) => !prev); }} className="bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/80 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 6 }} transition={{ duration: 0.12 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-50 p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Status</label>
                        <select
                          value={book.status || 'Unread'}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-bg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Ownership</label>
                        <select
                          value={book.ownership || 'Owned'}
                          onChange={(e) => handleOwnershipChange(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-bg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                        >
                          {ownershipOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-border mt-3 pt-2">
                      <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-500/10 py-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete Book
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col px-0.5">
        <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
        
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-xs text-text-muted line-clamp-1">{book.author}</p>
          {renderOwnershipIcon()}
        </div>

        {book.personalRating ? (
          <div className="flex items-center gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn('w-3 h-3', star <= (book.personalRating || 0) ? 'fill-yellow-500 text-yellow-500' : 'fill-transparent text-gray-400 dark:text-gray-600')} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}