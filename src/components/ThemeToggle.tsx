import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-surface border border-transparent hover:border-border transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-text-muted hover:text-text" />
      ) : (
        <Moon className="w-5 h-5 text-text-muted hover:text-text" />
      )}
    </button>
  );
}