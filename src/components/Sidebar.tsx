import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight, Home, Compass, Sparkles, Activity } from 'lucide-react';
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

  const mainNav = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'My Library', icon: BookOpen, path: '/library' },
    { label: 'Discover', icon: Compass, path: '/discover' },
    { label: 'For You', icon: Sparkles, path: '/for-you' },
  ];

  const socialNav = [
    { label: 'Friends', icon: Users, path: '/friends' },
    { label: 'Feed', icon: Activity, path: '/feed' },
  ];

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        key={item.label}
        to={item.path}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
          isActive ? "bg-primary/10 text-primary font-medium" : "text-text-muted hover:bg-bg hover:text-text",
          isCollapsed && "justify-center"
        )}
      >
        <motion.div animate={isActive ? { scaleY: [1, 0.8, 1.1, 1], scaleX: [1, 1.1, 0.9, 1] } : {}} transition={{ duration: 0.3 }}>
          <Icon className="w-5 h-5 flex-shrink-0" />
        </motion.div>
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn("h-screen sticky top-0 border-r border-border bg-surface hidden md:flex flex-col transition-all duration-300 relative flex-shrink-0", isCollapsed ? "w-20" : "w-64")}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 text-text-muted hover:text-primary hover:border-primary transition-colors z-10 shadow-sm" aria-label="Toggle Sidebar">
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </motion.button>

      <div className={cn("p-6 flex items-center flex-shrink-0", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="text-primary flex-shrink-0"><SpineLogo className="w-8 h-8" /></div>
        {!isCollapsed && <h1 className="text-2xl font-serif font-bold text-primary truncate">Spine.</h1>}
      </div>

      <nav className="flex-1 px-3 mt-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
        {/* Main Section */}
        <div className="space-y-1">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Main</p>}
          {mainNav.map(renderNavItem)}
        </div>

        {/* Social Section */}
        <div className="space-y-1">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Social</p>}
          {socialNav.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border flex-shrink-0 mt-auto">
        <Link to="/settings" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-2", location.pathname === '/settings' ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-bg", isCollapsed && "justify-center")}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {user && (
          <div className={cn("flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-bg/50", isCollapsed && "justify-center")}>
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

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout} className={cn("flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors w-full", isCollapsed && "justify-center")}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}