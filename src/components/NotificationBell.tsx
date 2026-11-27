import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Notifications');
      return data;
    },
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-bg transition-colors">
        <Bell className="w-5 h-5 text-text" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
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