import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SpineLogo } from './SpineLogo';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'My Library', icon: BookOpen, path: '/dashboard' },
    { label: 'Friends', icon: Users, path: '/friends' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "border-r border-border bg-surface hidden md:flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 text-text-muted hover:text-primary hover:border-primary transition-colors z-10 shadow-sm"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo area */}
      <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="text-primary flex-shrink-0">
          <SpineLogo className="w-8 h-8" />
        </div>
        {!isCollapsed && (
          <h1 className="text-2xl font-serif font-bold text-primary truncate">
            Spine.
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 mt-4">
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

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}