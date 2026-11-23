import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1.5 w-full group"
      >
        <label className="text-sm font-medium text-text transition-colors group-focus-within:text-primary">
          {label}
        </label>

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 border rounded-xl bg-surface text-text text-sm transition-all shadow-sm",
              "focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary",
              error ? "border-red-500 focus:ring-red-500/15 focus:border-red-500" : "border-border",
              icon && "pl-10",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              tabIndex={-1}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={showPassword ? 'show' : 'hide'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="text-xs text-red-500 font-medium pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Input.displayName = 'Input';