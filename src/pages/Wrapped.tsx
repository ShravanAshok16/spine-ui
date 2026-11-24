import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import { apiClient } from '../api/client';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Sparkles, BookOpen, Star, Award } from 'lucide-react';

export default function Wrapped() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['wrapped'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Users/wrapped');
      return data;
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading your Wrapped...</div>;
  if (!stats) return null;

  return (
    <div className="h-screen overflow-hidden flex bg-[#0a0a0a] text-white">
      <Confetti recycle={false} numberOfPieces={500} gravity={0.1} />
      
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-3xl w-full space-y-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl font-serif font-bold mb-4">{stats.year} Wrapped</h1>
            <p className="text-xl text-white/70">Your reading year in review.</p>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <BookOpen className="w-10 h-10 mx-auto text-primary mb-2" />
                <p className="text-5xl font-bold">{stats.totalBooks}</p>
                <p className="text-sm text-white/60 uppercase tracking-widest mt-2">Books Finished</p>
              </div>
              <div>
                <FileTextIcon className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                <p className="text-5xl font-bold">{stats.totalPages.toLocaleString()}</p>
                <p className="text-sm text-white/60 uppercase tracking-widest mt-2">Pages Read</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Star className="w-6 h-6 text-yellow-400 mb-3" />
              <p className="text-xs text-white/60 uppercase tracking-widest">Top Genre</p>
              <p className="text-2xl font-serif font-bold mt-1">{stats.topGenre}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Award className="w-6 h-6 text-purple-400 mb-3" />
              <p className="text-xs text-white/60 uppercase tracking-widest">Top Author</p>
              <p className="text-2xl font-serif font-bold mt-1">{stats.topAuthor}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
             <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
               <Sparkles className="w-5 h-5" /> Share Wrapped
             </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function FileTextIcon(props: any) {
  return <BookOpen {...props} />;
}