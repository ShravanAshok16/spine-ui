import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, X, Bell } from 'lucide-react';
import { apiClient } from '../api/client';

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Notifications');
      return data;
    }
  });

  const markAllRead = () => {
    queryClient.setQueryData(['notifications'], (old: any) => 
      old?.map((n: any) => ({ ...n, unread: false }))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      className="absolute right-0 top-12 w-80 md:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-serif font-bold">Notifications</h3>
        <button onClick={onClose} className="p-1 hover:bg-bg rounded-full"><X className="w-4 h-4 text-text-muted" /></button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} className={`flex gap-3 px-5 py-4 hover:bg-bg transition-colors cursor-pointer border-b border-border/50 last:border-0 ${n.unread ? 'bg-primary/5' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-text-muted mt-1">{new Date(n.time).toLocaleDateString()}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
      
      {notifications.some((n: any) => n.unread) && (
        <div className="px-5 py-3 border-t border-border text-center bg-surface">
          <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">
            Mark all as read
          </button>
        </div>
      )}
    </motion.div>
  );
}