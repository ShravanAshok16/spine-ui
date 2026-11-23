import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Input } from './Input';

interface Props {
  type: 'profile' | 'email' | 'password';
  onClose: () => void;
}

export function AccountSettingsModal({ type, onClose }: Props) {
  // 🔥 FIX: Added refreshUser here
  const { user, refreshUser } = useAuth(); 
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (type === 'profile') {
        return apiClient.put('/api/Account/profile', { firstName, lastName, displayName, phoneNumber });
      } else if (type === 'email') {
        return apiClient.put('/api/Account/email', { newEmail, currentPassword });
      } else if (type === 'password') {
        if (newPassword !== confirmPassword) throw new Error("Passwords don't match");
        return apiClient.put('/api/Account/password', { currentPassword, newPassword });
      }
    },
    onSuccess: async () => {
      toast.success('Account updated successfully!');
      
      if (type === 'email' || type === 'password') {
        toast.info('Please log in again.');
        localStorage.removeItem('spine_token');
        window.location.href = '/login';
      } else {
        await refreshUser(); // 🔥 This will now work
        onClose();
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const titles = {
    profile: 'Edit Profile',
    email: 'Change Email',
    password: 'Change Password',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold">{titles[type]}</h3>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors"><X className="w-5 h-5 text-text-muted" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'profile' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
                <Input label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                <Input label="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </>
            )}

            {type === 'email' && (
              <>
                <Input label="New Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              </>
            )}

            {type === 'password' && (
              <>
                <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </>
            )}

            <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50 mt-2">
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}