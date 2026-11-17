import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function MobileNav() {
  const location = useLocation();
  const items = [
    { icon: Home, path: '/dashboard' },
    { icon: BookOpen, path: '/library' },
    { icon: Compass, path: '/discover' },
    { icon: User, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md border border-border shadow-lg rounded-full flex md:hidden z-40 px-4 py-2 gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={cn(
              "p-3 rounded-full transition-colors", 
              isActive ? "bg-primary text-white shadow-sm" : "text-text-muted hover:bg-bg"
            )}
          >
            <motion.div whileTap={{ scale: 0.85, rotate: -10 }} transition={{ type: "spring" }}>
              <Icon className="w-5 h-5" />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}