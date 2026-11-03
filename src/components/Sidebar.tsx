import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { SpineLogo } from './SpineLogo';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'My Library', icon: BookOpen, path: '/dashboard' },
    { label: 'Friends', icon: Users, path: '/friends' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 border-r border-border bg-surface hidden md:flex flex-col transition-all duration-300 relative flex-shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 text-text-muted hover:text-primary hover:border-primary transition-colors z-10 shadow-sm"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </motion.button>

      <div className={cn("p-6 flex items-center flex-shrink-0", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="text-primary flex-shrink-0">
          <SpineLogo className="w-8 h-8" />
        </div>
        {!isCollapsed && (
          <h1 className="text-2xl font-serif font-bold text-primary truncate">
            Spine.
          </h1>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.label}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-text-muted hover:bg-bg hover:text-text",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border flex-shrink-0 mt-auto">
        
        {/* User Profile Section */}
        {user && (
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-bg/50",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{user.displayName}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}