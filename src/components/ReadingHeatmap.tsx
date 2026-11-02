import { cn } from '../lib/utils';

interface Props {
  // Map of date string (YYYY-MM-DD) → intensity 0-4
  activity: Record<string, number>;
}

function getLast35Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

const intensityStyles = [
  'bg-surface-hover',              // 0: no activity
  'bg-primary/20',                 // 1: light
  'bg-primary/40',                 // 2: medium
  'bg-primary/70',                 // 3: strong
  'bg-primary',                    // 4: very strong
];

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function ReadingHeatmap({ activity }: Props) {
  const days = getLast35Days();

  // Group into weeks (5 weeks × 7 days)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Reading Activity</h3>
          <p className="text-xs text-text-muted">Last 5 weeks</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>Less</span>
          {intensityStyles.map((style, i) => (
            <div key={i} className={cn('w-3 h-3 rounded-sm', style)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1 text-[10px] text-text-muted">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 flex items-center justify-center w-3">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const key = formatDateKey(day);
              const intensity = activity[key] ?? 0;
              return (
                <div
                  key={key}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors hover:ring-2 hover:ring-primary/50 cursor-pointer',
                    intensityStyles[intensity]
                  )}
                  title={`${day.toLocaleDateString()}: ${intensity > 0 ? 'Read' : 'No activity'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}