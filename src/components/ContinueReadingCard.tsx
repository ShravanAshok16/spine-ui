import { useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import type { UserBook } from '../api/types';
import { LanguageBadge } from './LanguageBadge';
import { LogSessionModal } from './LogSessionModal';
import { UpdateProgressModal } from './UpdateProgressModal';
import { motion } from 'framer-motion';

export function ContinueReadingCard({ book }: { book: UserBook }) {
  const [showLogSession, setShowLogSession] = useState(false);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);

  const progress = book.totalPages ? Math.min(100, (book.currentPage / book.totalPages) * 100) : 0;

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-5 flex gap-5 shadow-sm hover:shadow-md transition-all">
        {/* Cover */}
        <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-bg border border-border relative shadow-sm">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/40"><BookOpen className="w-8 h-8" /></div>
          )}
          <div className="absolute bottom-1 left-1">
            <LanguageBadge code={book.language || 'en'} />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1">{book.title}</h3>
            <p className="text-sm text-text-muted mb-2">{book.author}</p>
            
            {/* Progress Ring / Bar */}
            <div className="flex items-center gap-3 mt-4">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border" />
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - progress} className="text-primary transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute text-[10px] font-bold">{Math.round(progress)}%</span>
              </div>
              <div>
                <p className="text-xs font-medium text-text">Page {book.currentPage} of {book.totalPages || '?'}</p>
                <p className="text-[10px] text-text-muted">You're {Math.round(progress)}% through</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLogSession(true)} className="flex-1 bg-primary/10 text-primary py-1.5 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Log Session
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowUpdateProgress(true)} className="flex-1 bg-surface border border-border text-text py-1.5 rounded-lg text-xs font-medium hover:bg-bg transition-colors">
              Update Progress
            </motion.button>
          </div>
        </div>
      </div>

      {showLogSession && <LogSessionModal book={book} onClose={() => setShowLogSession(false)} />}
      {showUpdateProgress && <UpdateProgressModal book={book} onClose={() => setShowUpdateProgress(false)} />}
    </>
  );
}