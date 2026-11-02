import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Settings, LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-primary">Spine.</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
            <BookOpen className="w-5 h-5" /> My Library
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:bg-bg rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Friends
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:bg-bg rounded-lg transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-error transition-colors w-full">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-8">
          <h2 className="font-medium">My Library</h2>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors">
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </header>
        <div className="p-8">
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center text-text-muted">
            Your books will appear here soon.
          </div>
        </div>
      </main>
    </div>
  );
}