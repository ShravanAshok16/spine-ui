import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home, Library, Compass, BarChart3, Users, Rss,
  Settings, LogOut, Moon, Plus, Search
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); 

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const cycleTheme = () => {
    if (theme === 'light') toggleTheme('dark');
    else if (theme === 'dark') toggleTheme('void');
    else toggleTheme('light');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
        <Command className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden" loop>
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-5 h-5 text-text-muted" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent py-4 text-text focus:outline-none placeholder:text-text-muted"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-sm text-text-muted">No results found.</Command.Empty>

            <Command.Group heading="Navigation" className="text-xs text-text-muted px-2 py-1.5">
              {/* 🔥 FIX: Changed '/' to '/dashboard' */}
              <Item icon={<Home className="w-4 h-4" />} label="Dashboard" onSelect={() => runCommand(() => navigate('/dashboard'))} />
              <Item icon={<Library className="w-4 h-4" />} label="My Library" onSelect={() => runCommand(() => navigate('/library'))} />
              <Item icon={<Compass className="w-4 h-4" />} label="Discover Books" onSelect={() => runCommand(() => navigate('/discover'))} />
              <Item icon={<BarChart3 className="w-4 h-4" />} label="Reading Stats" onSelect={() => runCommand(() => navigate('/stats'))} />
              <Item icon={<Users className="w-4 h-4" />} label="Friends" onSelect={() => runCommand(() => navigate('/friends'))} />
              <Item icon={<Rss className="w-4 h-4" />} label="Activity Feed" onSelect={() => runCommand(() => navigate('/feed'))} />
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs text-text-muted px-2 py-1.5 mt-2">
              <Item icon={<Plus className="w-4 h-4" />} label="Add a New Book" onSelect={() => runCommand(() => navigate('/library?add=true'))} />
              <Item icon={<Moon className="w-4 h-4" />} label={`Toggle Theme (Currently ${theme})`} onSelect={() => runCommand(cycleTheme)} />
            </Command.Group>

            <Command.Group heading="System" className="text-xs text-text-muted px-2 py-1.5 mt-2">
              <Item icon={<Settings className="w-4 h-4" />} label="Settings" onSelect={() => runCommand(() => navigate('/settings'))} />
              <Item icon={<LogOut className="w-4 h-4" />} label="Log Out" onSelect={() => runCommand(() => { logout(); navigate('/login'); })} />
            </Command.Group>
          </Command.List>

          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-text-muted">
            <span>Navigate with ↑ ↓ · Enter to select</span>
            <span className="font-mono">ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Item({ icon, label, onSelect }: { icon: React.ReactNode; label: string; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-text aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
    >
      {icon}
      {label}
    </Command.Item>
  );
}