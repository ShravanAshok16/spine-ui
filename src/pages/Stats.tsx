import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { getMyLibrary, getSessionStats } from '../api/library';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BookOpen } from 'lucide-react';

export default function Stats() {
  const { data: books = [] } = useQuery({ queryKey: ['library'], queryFn: getMyLibrary });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessionStats'], queryFn: getSessionStats });

  // Prepare line chart data (last 14 days)
  const lineData = sessions.slice(-14).map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pages: s.pagesRead
  }));

  // Prepare genre data
  const genreCounts: Record<string, number> = {};
  books.forEach(b => {
    if (b.genres) {
      b.genres.split(',').forEach(g => {
        const clean = g.trim();
        if (clean) genreCounts[clean] = (genreCounts[clean] || 0) + 1;
      });
    }
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 genres

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <h1 className="text-2xl font-serif font-bold text-text">Reading Statistics</h1>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Line Chart: Reading Pace */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif font-bold text-lg mb-6">Reading Pace (Last 14 Days)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} 
                    />
                    <Line type="monotone" dataKey="pages" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Genres */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif font-bold text-lg mb-6">Top Genres</h2>
              <div className="h-72 w-full flex items-center justify-center">
                {genreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-text-muted flex flex-col items-center"><BookOpen className="w-8 h-8 mb-2 opacity-50"/> Not enough genre data yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}