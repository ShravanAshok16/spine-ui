import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 flex items-center transition-colors duration-500 shadow-inner",
        isDark ? "bg-indigo-950 border border-indigo-900" : "bg-sky-200 border border-sky-300"
      )}
      aria-label="Toggle theme"
    >
      {/* Background Stars (Only visible in Dark Mode) */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 1 : 0 }}
        className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
      >
        <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-5 left-5 w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>
        <div className="absolute top-3 left-8 w-1 h-1 bg-white rounded-full opacity-40"></div>
      </motion.div>

      {/* The Knob (Sun / Moon) */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center z-10",
          isDark 
            ? "bg-slate-200 shadow-[inset_-4px_-2px_0_rgba(0,0,0,0.15)] ml-auto" // Moon
            : "bg-yellow-400 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.1)] mr-auto"  // Sun
        )}
      >
        {/* Moon Craters (Only visible when Dark) */}
        {isDark && (
          <>
            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-gray-400/50 rounded-full"></div>
            <div className="absolute bottom-2 left-3 w-1 h-1 bg-gray-400/50 rounded-full"></div>
          </>
        )}
      </motion.div>
    </button>
  );
}