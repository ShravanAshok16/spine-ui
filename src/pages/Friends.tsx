import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Search, UserPlus, Check, Loader2, Users } from 'lucide-react';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { NotificationBell } from '../components/NotificationBell';

export default function Friends() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Friendships');
      return data;
    }
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Friendships/requests');
      return data;
    }
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const { data } = await apiClient.get(`/api/Users/search?q=${searchQuery}`);
      return data;
    },
    enabled: searchQuery.length >= 2,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => apiClient.post(`/api/Friendships/request/${targetUserId}`),
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/api/Friendships/${id}/accept`),
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-20">
          <h1 className="text-2xl font-serif font-bold text-text">Friends</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for readers by name or email..."
                className="w-full pl-12 pr-4 py-4 border border-border rounded-xl bg-surface focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary text-lg shadow-sm"
              />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />}
            </div>

            {searchQuery.length >= 2 && (
              <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
                {searchResults.length === 0 && !isSearching ? (
                  <p className="p-4 text-center text-text-muted text-sm">No users found.</p>
                ) : (
                  searchResults.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{u.displayName}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                      <button onClick={() => sendRequestMutation.mutate(u.id)} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Add Friend
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex border-b border-border">
              <button onClick={() => setActiveTab('friends')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'friends' ? 'border-primary text-primary' : 'border-transparent text-text-muted'}`}>
                My Friends ({friends.length})
              </button>
              <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-text-muted'}`}>
                Requests ({requests.length})
              </button>
            </div>

            <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
              {activeTab === 'friends' && (
                friendsLoading ? <p className="p-4 text-center">Loading...</p> :
                friends.length === 0 ? (
                  // 🔥 Premium Empty State
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-surface border border-border rounded-3xl p-10 text-center my-6">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-2">No friends yet</h3>
                      <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
                        Search for readers above by name or email to start connecting.
                      </p>
                    </div>
                  </div>
                ) : (
                  friends.map((f: any) => (
                    <div key={f.friendshipId} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {f.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{f.displayName}</p>
                        <p className="text-xs text-text-muted">{f.email}</p>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'requests' && (
                requestsLoading ? <p className="p-4 text-center">Loading...</p> :
                requests.length === 0 ? <p className="p-8 text-center text-text-muted">No pending requests.</p> :
                requests.map((r: any) => (
                  <div key={r.friendshipId} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{r.displayName}</p>
                      <p className="text-xs text-text-muted">wants to be friends</p>
                    </div>
                    <button onClick={() => acceptRequestMutation.mutate(r.friendshipId)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}