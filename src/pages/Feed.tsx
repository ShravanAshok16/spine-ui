import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { apiClient } from '../api/client';
import { NotificationBell } from '../components/NotificationBell';
import { Activity, BookOpen, Star } from 'lucide-react';

export default function Feed() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Friendships/feed');
      return data;
    }
  });

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-20">
          <h1 className="text-2xl font-serif font-bold text-text">Activity Feed</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-4">
            {isLoading ? (
               <div className="animate-pulse space-y-4">
                 {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface rounded-xl border border-border"></div>)}
               </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-20 text-text-muted">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity from your friends.</p>
              </div>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="bg-surface border border-border rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {act.type === 'Finished' ? <BookOpen className="w-6 h-6 text-primary" /> : <Star className="w-6 h-6 text-yellow-500" />}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-bold">{act.userDisplayName}</span> {act.message}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}