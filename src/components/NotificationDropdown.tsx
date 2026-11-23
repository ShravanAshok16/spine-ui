import { motion } from 'framer-motion';
import { Users, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type?: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

interface Props {
  notifications: Notification[];
  onClose: () => void;
}

export function NotificationDropdown({ notifications, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      className="absolute right-0 top-12 w-80 md:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-serif font-bold">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-bg rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-text-muted">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.type === 'FriendRequest') {
                  navigate('/friends');
                  onClose();
                }
              }}
              className={`w-full flex gap-3 px-5 py-4 text-left hover:bg-bg transition-colors ${
                n.unread ? 'bg-primary/5' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                  {n.body}
                </p>
                <p className="text-[10px] text-text-muted mt-1.5">
                  {new Date(n.time).toLocaleDateString()}
                </p>
              </div>

              {n.unread && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}