import { LayoutGrid, List, ChevronDown, Library, Grid2X2, Grid3X3, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export type ViewMode = 'grid' | 'list';
export type FilterStatus = 'All' | 'Reading' | 'Paused' | 'Finished' | 'Unread' | 'DNF';
export type SortOption = 'newest' | 'title' | 'author' | 'rating';
export type GridSize = 'sm' | 'md' | 'lg';

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
  groupBySeries: boolean;
  setGroupBySeries: (val: boolean) => void;
  onCreateSeries?: () => void;
  gridSize: GridSize;
  setGridSize: (size: GridSize) => void;
  ownership: string;
  setOwnership: (val: string) => void;
  minRating: string;
  setMinRating: (val: string) => void;
  // 🔥 New Props
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
}

export function LibraryToolbar({
  viewMode, setViewMode, filterStatus, setFilterStatus,
  languages, selectedLanguage, setSelectedLanguage,
  genres, selectedGenre, setSelectedGenre,
  sortBy, setSortBy, groupBySeries, setGroupBySeries,
  onCreateSeries, gridSize, setGridSize, ownership, setOwnership, minRating, setMinRating,
  isSelectionMode, setIsSelectionMode
}: Props) {
  const statuses: FilterStatus[] = ['All', 'Reading', 'Paused', 'Finished', 'Unread', 'DNF'];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'author', label: 'Author (A-Z)' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6 w-full">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
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

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* 🔥 Selection Mode Toggle */}
          <button
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              isSelectionMode 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-surface text-text-muted hover:text-text border-border'
            )}
          >
            <CheckSquare className="w-4 h-4" />
            {isSelectionMode ? 'Cancel Selection' : 'Select'}
          </button>

          <button
            onClick={() => setGroupBySeries(!groupBySeries)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent',
              groupBySeries ? 'bg-primary/10 text-primary border-primary/20' : 'text-text-muted hover:bg-surface border-border'
            )}
          >
            <Library className="w-4 h-4" />
            Group by Series
          </button>

          {viewMode === 'grid' && (
            <div className="flex items-center bg-surface border border-border rounded-lg p-1 shadow-sm">
              <button onClick={() => setGridSize('sm')} className={cn('p-1.5 rounded-md transition-colors', gridSize === 'sm' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text')}>
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button onClick={() => setGridSize('md')} className={cn('p-1.5 rounded-md transition-colors', gridSize === 'md' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setGridSize('lg')} className={cn('p-1.5 rounded-md transition-colors', gridSize === 'lg' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text')}>
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center bg-surface border border-border rounded-lg p-1 shadow-sm">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text')}>
              <LayoutGrid className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-bg text-primary shadow-sm' : 'text-text-muted hover:text-text')}>
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          {onCreateSeries && (
            <button
              onClick={onCreateSeries}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm ml-auto lg:ml-0"
            >
              + Create Series
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
        <div className="relative">
          <select value={ownership} onChange={(e) => setOwnership(e.target.value)} className="appearance-none bg-surface border border-border text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-text-muted hover:text-text transition-colors">
            <option value="All">Any Ownership</option>
            <option value="Owned">Owned</option>
            <option value="Wishlist">Wishlist</option>
            <option value="LentOut">Lent Out</option>
            <option value="Sold">Sold / Donated</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

        <div className="relative">
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="appearance-none bg-surface border border-border text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-text-muted hover:text-text transition-colors">
            <option value="All">Any Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
        </div>

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