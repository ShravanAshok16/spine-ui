import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, Star, Heart, Share2, BookOpen, ShoppingCart, RefreshCw } from 'lucide-react';
import { LanguageBadge } from '../components/LanguageBadge';
import { motion } from 'framer-motion';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

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
    refetchOnMount: 'always',
  });

  const genreList = typeof book?.genres === 'string' 
    ? book.genres.split(',').map((g: string) => g.trim()).filter(Boolean) 
    : (book?.genres || []);

  const hasDescription = book?.description && book.description.trim().length > 0;

  return (
    <div className="min-h-screen flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-6 md:p-8 flex items-center gap-4 border-b border-border bg-surface sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg rounded-full flex items-center gap-2 text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
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
              {book.coverUrl && (
                <div className="absolute inset-0 opacity-30 blur-3xl scale-110" style={{ backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-8 -mt-40 relative z-10 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                
                <div className="flex flex-col items-center md:items-start gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-surface relative">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center"><BookOpen className="w-12 h-12 text-primary/40" /></div>
                    )}
                    <div className="absolute bottom-3 left-3"><LanguageBadge code={book.language || 'en'} size="md" /></div>
                  </motion.div>
                  
                  <div className="flex gap-2 w-full md:w-64">
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm">
                      {book.status ? 'Update Status' : 'Add to Library'}
                    </button>
                    <button className="p-3 border border-border rounded-xl bg-surface hover:bg-bg shadow-sm"><Heart className="w-5 h-5 text-text-muted" /></button>
                    <button className="p-3 border border-border rounded-xl bg-surface hover:bg-bg shadow-sm"><Share2 className="w-5 h-5 text-text-muted" /></button>
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
                    <span className="flex items-center gap-1 font-medium"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> No ratings</span>
                    <span className="w-px h-4 bg-border"></span>
                    <span className="font-medium">{book.pageCount || book.totalPages ? `${book.pageCount || book.totalPages} pages` : 'Page count unknown'}</span>
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
                        
                        {/* 🔥 Fallback UI for missing descriptions */}
                        {!hasDescription ? (
                          <div className="bg-surface border border-border rounded-xl p-6 text-center">
                            <p className="text-sm text-text-muted mb-4">No description available.</p>
                            <button 
                              onClick={() => refetch()} 
                              disabled={isFetching}
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                              {isFetching ? 'Fetching from APIs...' : 'Try fetching description again'}
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

                        <div className="pt-6 border-t border-border flex gap-4">
                          <a href={`https://www.amazon.in/s?k=${book.isbn || book.title}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-primary/5 px-4 py-2 rounded-lg">
                            <ShoppingCart className="w-4 h-4" /> Buy on Amazon
                          </a>
                          <a href={`https://www.flipkart.com/search?q=${book.isbn || book.title}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-primary/5 px-4 py-2 rounded-lg">
                            <ShoppingCart className="w-4 h-4" /> Buy on Flipkart
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                      <div className="text-center py-12 text-text-muted bg-surface/50 rounded-xl border border-border">
                        <p className="text-sm">No reviews yet. Be the first to review!</p>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div>
                        <textarea placeholder="Write your private notes here..." className="w-full h-40 p-4 bg-surface border border-border rounded-xl focus:ring-4 focus:ring-primary/15 text-sm resize-none" defaultValue={book.privateNotes || ''} />
                        <p className="text-xs text-text-muted mt-2">Auto-saves as you type.</p>
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