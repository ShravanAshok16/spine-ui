import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-border rounded-2xl bg-surface/30"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}