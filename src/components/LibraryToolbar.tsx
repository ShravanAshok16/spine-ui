import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';
export type FilterStatus = 'All' | 'Reading' | 'Finished' | 'Unread';
export type SortOption = 'newest' | 'title' | 'author' | 'rating';

interface Props {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  languages: string[];
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  genres: string[];
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function LibraryToolbar({
  viewMode, setViewMode, filterStatus, setFilterStatus,
  languages, selectedLanguage, setSelectedLanguage,
  genres, selectedGenre, setSelectedGenre,
  sortBy, setSortBy,
}: Props) {
  const statuses: FilterStatus[] = ['All', 'Reading', 'Finished', 'Unread'];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'author', label: 'Author (A-Z)' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Sliding Pill Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                filterStatus === status ? 'text-white' : 'text-text-muted hover:text-text'
              )}
            >
              {filterStatus === status && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{status}</span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-surface border border-border rounded-lg p-1 shadow-sm">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            <List className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="appearance-none bg-surface border border-border text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-text-muted hover:text-text transition-colors"
          >
            <option value="All">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="appearance-none bg-surface border border-border text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-text-muted hover:text-text transition-colors"
          >
            <option value="All">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-surface border border-border text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-text-muted hover:text-text transition-colors"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>
      </div>
    </div>
  );
}