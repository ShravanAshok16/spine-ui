import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function PublicProfileSettings() {
  const [privacy, setPrivacy] = useState('FriendsOnly');
  const [bio, setBio] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['privacy'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Account/privacy');
      return data;
    }
  });

  useEffect(() => {
    if (data) {
      setPrivacy(data.privacySetting || 'FriendsOnly');
      setBio(data.bio || '');
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => apiClient.put('/api/Account/privacy', { privacySetting: privacy, bio }),
    onSuccess: () => {
      toast.success('Privacy settings updated');
      queryClient.invalidateQueries({ queryKey: ['privacy'] });
    },
    onError: () => toast.error('Failed to update settings')
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Profile Visibility</h2>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          {['Public', 'FriendsOnly', 'Private'].map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="privacy" value={option} checked={privacy === option} onChange={() => setPrivacy(option)} className="accent-primary" />
              <div>
                <p className="text-sm font-medium">{option === 'FriendsOnly' ? 'Friends Only' : option}</p>
                <p className="text-xs text-text-muted">
                  {option === 'Public' && 'Anyone can see your library and profile.'}
                  {option === 'FriendsOnly' && 'Only approved friends can see your library.'}
                  {option === 'Private' && 'Your library is completely private.'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Bio</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell other readers a little about yourself..."
          className="w-full p-4 rounded-xl border border-border bg-surface focus:ring-4 focus:ring-primary/15 resize-none h-32"
          maxLength={280}
        />
        <p className="text-xs text-text-muted mt-1 text-right">{bio.length}/280</p>
      </section>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-hover"
      >
        {mutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}