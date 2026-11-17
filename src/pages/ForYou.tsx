import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Sparkles } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export default function ForYou() {
  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8">
          <h1 className="text-2xl font-serif font-bold text-text">For You</h1>
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
          <EmptyState 
            icon={<Sparkles className="w-8 h-8" />}
            title="Recommendations coming soon"
            description="We are analyzing your library to find the perfect next read."
          />
        </div>
      </main>
    </div>
  );
}