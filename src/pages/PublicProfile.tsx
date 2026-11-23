import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { apiClient } from '../api/client';
import { BookCover } from '../components/BookCover';
import { User, BookOpen, Star } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/Users/${username}`);
      return data;
    },
    retry: false, // Don't retry if they get a 403 Forbidden
  });

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 sticky top-0 z-20">
          <h1 className="text-2xl font-serif font-bold text-text">@{username}</h1>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">Loading profile...</div>
          ) : isError || !profile ? (
            <div className="text-center py-20 text-text-muted">
              <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h2 className="text-2xl font-serif font-bold mb-2">Profile Private</h2>
              <p>This user's library is private or only visible to friends.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-surface border border-border rounded-2xl p-8">
                <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-serif font-bold">
                  {profile.displayName.charAt(0)}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-serif font-bold">{profile.displayName}</h2>
                  <p className="text-text-muted mt-1">{profile.bio || "No bio yet."}</p>
                  
                  <div className="flex gap-6 mt-4 justify-center md:justify-start">
                    <div className="text-center"><p className="font-bold text-xl">{profile.stats.totalBooks}</p><p className="text-xs text-text-muted">Total Books</p></div>
                    <div className="text-center"><p className="font-bold text-xl text-green-500">{profile.stats.finished}</p><p className="text-xs text-text-muted">Finished</p></div>
                  </div>
                </div>
              </div>

              {/* Library */}
              <div>
                <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Library</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {profile.books.map((book: any, i: number) => (
                     <BookCover 
                       key={book.id} 
                       index={i}
                       book={{
                         ...book,
                         id: book.id,
                         // Map the public profile response to UserBook type
                         isFavourite: false, currentPage: 0, totalPages: 0, language: 'en', genres: null,
                         privateNotes: null, lentTo: null, addedAt: '', seriesId: null, seriesName: null, isbn: null, ownership: 'Owned'
                       }} 
                     />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}