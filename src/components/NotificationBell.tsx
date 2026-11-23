import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = 3; // Mock unread count

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-bg transition-colors">
        <Bell className="w-5 h-5 text-text" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <NotificationDropdown onClose={() => setOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}