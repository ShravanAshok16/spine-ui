import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, Star, Heart, Share2, BookOpen, ShoppingCart, RefreshCw, Check, Trash2 } from 'lucide-react';
import { LanguageBadge } from '../components/LanguageBadge';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { toggleFavourite, deleteUserBook } from '../api/library';
import { StarRating } from '../components/StarRating'; // 🔥 Import the new component

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);

  const initialBook = location.state?.book;

  const { data: book, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/Books/details/${encodeURIComponent(id || '')}`);
      return data;
    },
    enabled: !!id,
    placeholderData: initialBook,
    staleTime: 0,
  });

  const { data: library = [] } = useQuery({
    queryKey: ['library'],
    queryFn: () => apiClient.get('/api/UserBooks').then((r) => r.data),
  });

  const userBook = library.find((ub: any) => 
    (book?.isbn && ub.isbn === book.isbn) || 
    (ub.title?.toLowerCase() === book?.title?.toLowerCase() && ub.author?.toLowerCase() === book?.author?.toLowerCase())
  );
  const isInLibrary = !!userBook;

  // 🔥 Mutations
  const addMutation = useMutation({
    mutationFn: async (ownership: string) => {
      if (!book) return;
      if (book.isbn) {
        return apiClient.post('/api/UserBooks', { isbn: book.isbn, ownership });
      }
      return apiClient.post('/api/UserBooks/manual', {
        title: book.title, author: book.author, isbn: book.isbn, coverUrl: book.coverUrl,
        language: book.language, description: book.description, pageCount: book.pageCount,
        seriesName: book.seriesName, seriesPosition: book.seriesPosition, genres: book.genres,
        ownership // Pass to manual too
      });
    },
    onSuccess: () => {
      toast.success('Added to Library');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['book', id] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!userBook) return;
      await apiClient.put(`/api/UserBooks/${userBook.id}`, {
        status: userBook.status, currentPage: userBook.currentPage,
        personalRating: userBook.personalRating, privateNotes: userBook.privateNotes,
        lentTo: userBook.lentTo, ownership: userBook.ownership,
        ...data // overwrite with new changes
      });
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['library'] });
      const previous = queryClient.getQueryData(['library']);
      queryClient.setQueryData(['library'], (old: any) => 
        old?.map((b: any) => b.id === userBook.id ? { ...b, ...newData } : b)
      );
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) queryClient.setQueryData(['library'], context.previous);
      toast.error('Failed to update');
    }
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!userBook) return;
      await deleteUserBook(userBook.id);
    },
    onSuccess: () => {
      toast.success('Removed from Library');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      navigate('/library');
    }
  });

  const handleShare = async () => {
    const shareData = { title: book.title, text: `Check out "${book.title}" on Spine!`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
    } catch (err) {}
  };

  const genreList = typeof book?.genres === 'string' ? book.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : (book?.genres || []);
  const hasDescription = book?.description && book.description.trim().length > 0;
  const gradients = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
  const gradientClass = gradients[(book?.title?.charCodeAt(0) || 0) % gradients.length];

  return (
    <div className="min-h-screen flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b border-border bg-surface sticky top-0 z-20 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg rounded-full flex items-center gap-2 text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="w-px h-6 bg-border mx-2"></div>
          <div>
            <h1 className="text-xl font-serif font-bold text-text leading-tight">Book Details</h1>
            <p className="text-xs text-text-muted">{book?.title || 'Loading...'}</p>
          </div>
        </div>

        {isLoading && !book ? (
          <div className="p-8 text-center text-text-muted">Loading book details...</div>
        ) : isError || !book ? (
          <div className="p-8 text-center flex flex-col items-center mt-20">
            <BookOpen className="w-16 h-16 text-text-muted/30 mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Book not found</h2>
            <p className="text-text-muted mb-6">We couldn't find this book.</p>
            <button onClick={() => navigate('/library')} className="bg-primary text-white px-6 py-2 rounded-lg">Go to Library</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
              {book.coverUrl && !imageError && (
                <div className="absolute inset-0 opacity-30 blur-3xl scale-110" style={{ backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-8 -mt-40 relative z-10 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                
                <div className="flex flex-col items-center md:items-start gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-surface relative bg-surface">
                    {book.coverUrl && !imageError ? (
                      <img src={book.coverUrl} alt={book.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn("w-full h-full flex flex-col items-center justify-center p-4 text-white bg-gradient-to-br", gradientClass)}>
                        <BookOpen className="w-10 h-10 mb-4 opacity-50" />
                        <p className="font-serif font-bold text-center line-clamp-4">{book.title}</p>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3"><LanguageBadge code={book.language || 'en'} size="md" /></div>
                  </motion.div>
                  
                  {/* Action Bar */}
                  <div className="flex flex-col gap-2 w-full md:w-64">
                    {isInLibrary ? (
                      <div className="flex gap-2">
                        <button onClick={() => { if(confirm(`Remove "${book.title}"?`)) removeMutation.mutate(); }} disabled={removeMutation.isPending} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl font-medium hover:bg-red-500/20 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                          {removeMutation.isPending ? 'Removing...' : <><Trash2 className="w-4 h-4" /> Remove</>}
                        </button>
                        <button onClick={() => { updateMutation.mutate({ isFavourite: !userBook.isFavourite }); }} className="p-3 border border-border rounded-xl bg-surface hover:bg-bg shadow-sm transition-colors">
                          <Heart className={cn("w-5 h-5 transition-colors", userBook.isFavourite ? "fill-red-500 text-red-500" : "text-text-muted")} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => addMutation.mutate('Owned')} disabled={addMutation.isPending} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50">
                          {addMutation.isPending ? 'Adding...' : 'Add to Library'}
                        </button>
                        <button onClick={() => addMutation.mutate('Wishlist')} disabled={addMutation.isPending} className="flex-1 bg-surface border border-border text-text py-3 rounded-xl font-medium hover:border-primary transition-colors shadow-sm disabled:opacity-50">
                          + Wishlist
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                       <button onClick={handleShare} className="flex-1 p-3 border border-border rounded-xl bg-surface hover:bg-bg shadow-sm flex items-center justify-center gap-2 text-sm font-medium">
                         <Share2 className="w-4 h-4 text-text-muted" /> Share
                       </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6 mt-8 md:mt-40">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-text leading-tight mb-2">{book.title}</h1>
                    <p className="text-xl text-text-muted">by <span className="text-primary font-medium">{book.author}</span></p>
                  </div>
                  
                  {book.seriesName && (
                    <div className="inline-block px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">{book.seriesName}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-text-muted bg-surface p-3 rounded-xl border border-border w-fit">
                    {/* 🔥 Interactive Rating */}
                    <div className="flex items-center gap-2">
                      <StarRating 
                        rating={userBook?.personalRating} 
                        readonly={!isInLibrary} 
                        size="md"
                        onRatingChange={(r) => updateMutation.mutate({ personalRating: r })} 
                      />
                      <span className="text-xs font-medium">
                        {userBook?.personalRating ? `${userBook.personalRating}.0` : 'Rate'}
                      </span>
                    </div>
                    <span className="w-px h-4 bg-border"></span>
                    <span className="font-medium">{book.pageCount || book.totalPages ? `${book.pageCount || book.totalPages} pages` : 'Unknown'}</span>
                  </div>

                  <div className="flex border-b border-border mt-8 gap-6">
                    {['overview', 'reviews', 'notes'].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {!hasDescription ? (
                          <div className="bg-surface border border-border rounded-xl p-6 text-center">
                            <p className="text-sm text-text-muted mb-4">No description available.</p>
                            <button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                              {isFetching ? 'Fetching...' : 'Try again'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-base leading-relaxed text-text-muted">{book.description}</p>
                        )}
                        
                        {genreList.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {genreList.map((g: string, i: number) => (
                              <span key={i} className="text-xs font-medium bg-surface border border-border px-3 py-1.5 rounded-lg">{g}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                      <div className="text-center py-12 text-text-muted bg-surface/50 rounded-xl border border-border">
                        <p className="text-sm">No reviews yet.</p>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div>
                        <textarea 
                          placeholder="Write your private notes here..." 
                          className="w-full h-40 p-4 bg-surface border border-border rounded-xl focus:ring-4 focus:ring-primary/15 text-sm resize-none" 
                          defaultValue={book.privateNotes || ''} 
                          onBlur={(e) => isInLibrary && updateMutation.mutate({ privateNotes: e.target.value })}
                        />
                        <p className="text-xs text-text-muted mt-2">Auto-saves on blur.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}