import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') toggleTheme('dark');
    else if (theme === 'dark') toggleTheme('void');
    else toggleTheme('light');
  };

  return (
    <button onClick={cycleTheme} className="relative p-2 rounded-full hover:bg-surface border border-transparent hover:border-border transition-colors" aria-label="Toggle theme">
      <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 180 : theme === 'void' ? 360 : 0 }}>
        {theme === 'light' && <Sun className="w-5 h-5 text-text-muted" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-text-muted" />}
        {theme === 'void' && <Monitor className="w-5 h-5 text-text-muted" />}
      </motion.div>
    </button>
  );
}