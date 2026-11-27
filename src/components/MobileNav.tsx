import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, User, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function MobileNav() {
  const location = useLocation();
  
  const items = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: BookOpen, path: '/library', label: 'Library' },
    { icon: Compass, path: '/discover', label: 'Discover' },
    { icon: BarChart3, path: '/stats', label: 'Stats' },
    { icon: Sparkles, path: '/wrapped', label: 'Wrapped' },
    { icon: User, path: '/settings', label: 'Profile' },
  ];

  return (
    // Full width, fixed to bottom, respects iPhone safe areas
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl border-t border-border/50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              // Fitts Law: Make the tap area as large as possible
              className="relative flex flex-col items-center justify-center w-full h-full gap-1"
            >
              {/* Pattern 2: Expand the same element (layoutId) */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-2 top-1 bottom-1 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div
                // Doherty Threshold: Instant visual feedback on tap
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-text-muted hover:text-text"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}