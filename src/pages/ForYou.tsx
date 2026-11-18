import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { DiscoverRow } from './Discover';

export default function ForYou() {
  const navigate = useNavigate();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Books/recommendations');
      return data;
    }
  });

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> For You
            </h1>
            <p className="text-sm text-text-muted mt-1">Curated just for your taste.</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-20">
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2].map(i => <div key={i} className="h-64 bg-surface rounded-2xl animate-pulse"></div>)}
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState 
              icon={<Sparkles className="w-8 h-8" />}
              title="We need more data"
              description="Add a few more books to your library so we can learn your taste."
              action={{ label: "Go to Library", onClick: () => navigate('/library') }}
            />
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold mb-2">Your Next Great Read</h2>
                <p className="text-text-muted">Based on the genres you've been reading lately.</p>
              </div>
              <DiscoverRow 
                title="Recommended for You" 
                subtitle="Hand-picked based on your library" 
                books={recommendations} 
                isLoading={false} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}