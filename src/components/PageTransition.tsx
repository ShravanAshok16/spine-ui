import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(8px)' }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}