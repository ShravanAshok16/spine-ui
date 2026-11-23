import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';
import { Activity, Flame } from 'lucide-react';

interface HeatmapProps {
  data: { date: string; pagesRead: number }[];
}

export function Heatmap({ data = [] }: HeatmapProps) {
  // Generate the last 5 weeks (35 days) array
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    
    // Start from the beginning of the week (Monday) 4 weeks ago
    const start = startOfWeek(subDays(today, 28), { weekStartsOn: 1 });
    
    for (let i = 0; i < 35; i++) {
      const date = addDays(start, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const session = data.find((d) => d.date.startsWith(dateStr));
      const pages = session ? session.pagesRead : 0;

      result.push({
        date,
        dateStr,
        pages,
      });
    }
    return result;
  }, [data]);

  // Calculate Summary Stats
  const totalPages = data.reduce((sum, d) => sum + d.pagesRead, 0);
  const activeDays = data.filter(d => d.pagesRead > 0).length;

  // Determine color based on pages read (More granular)
  const getColor = (pages: number) => {
    if (pages === 0) return 'bg-border/40 hover:bg-border/60';
    if (pages <= 10) return 'bg-primary/30 hover:bg-primary/50';
    if (pages <= 30) return 'bg-primary/50 hover:bg-primary/70';
    if (pages <= 50) return 'bg-primary/70 hover:bg-primary/90';
    return 'bg-primary hover:bg-primary/90 shadow-[0_0_8px_rgba(var(--primary),0.5)]';
  };

  // Group days into weeks (columns)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const daysOfWeek = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col h-full justify-between">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-serif font-bold text-xl flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Reading Activity
          </h3>
          <p className="text-sm text-text-muted mt-1">Your reading over the last 5 weeks</p>
        </div>
        
        <div className="flex items-center gap-6 bg-bg/50 rounded-xl px-5 py-3 border border-border/50">
          <div className="text-center">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Total Pages</p>
            <p className="text-xl font-bold font-serif text-text">{totalPages}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Active Days</p>
            <p className="text-xl font-bold font-serif text-text flex items-center justify-center gap-1">
              {activeDays} <Flame className="w-4 h-4 text-orange-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* Day Labels (Y-axis) */}
        <div className="flex flex-col gap-2 pr-2 pt-1">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="h-5 text-[11px] font-medium text-text-muted flex items-center justify-end w-6">
              {day}
            </div>
          ))}
        </div>

        {/* Squares (X-axis) */}
        <div className="flex gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.pages} pages on ${format(day.date, 'MMM d, yyyy')}`}
                  className={cn(
                    "w-5 h-5 rounded-md transition-all duration-300 cursor-pointer relative group",
                    getColor(day.pages),
                    isSameDay(day.date, new Date()) && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                  )}
                >
                  {/* Custom Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-text text-bg text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                    {day.pages === 0 ? 'No reading' : `${day.pages} pages`}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs font-medium text-text-muted">
        <span>Less</span>
        <div className="w-4 h-4 rounded-md bg-border/40" />
        <div className="w-4 h-4 rounded-md bg-primary/30" />
        <div className="w-4 h-4 rounded-md bg-primary/50" />
        <div className="w-4 h-4 rounded-md bg-primary/70" />
        <div className="w-4 h-4 rounded-md bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}