import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { User, Settings as SettingsIcon, Shield, Bell, Trash2, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { PublicProfileSettings } from '../components/PublicProfileSettings'; // 🔥 Import the new component

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'public' | 'settings'>('settings');
  const [modalType, setModalType] = useState<'profile' | 'email' | 'password' | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'public', label: 'Public', icon: Shield },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <div className="flex-shrink-0 hidden md:block"><Sidebar /></div>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <h1 className="text-2xl font-serif font-bold text-text">Settings</h1>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Tabs */}
            <div className="flex border-b border-border mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  {/* Account */}
                  <section>
                    <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Account</h2>
                    <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
                      
                      {/* 🔥 Profile Button */}
                      <button onClick={() => setModalType('profile')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-text-muted" />
                          <span>Profile & Phone</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </button>

                      {/* 🔥 Email Button */}
                      <button onClick={() => setModalType('email')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-text-muted" />
                          <span>Email</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <span>{user?.email}</span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </button>

                      {/* 🔥 Password Button */}
                      <button onClick={() => setModalType('password')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-text-muted" />
                          <span>Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </button>

                    </div>
                  </section>

                  {/* Appearance */}
                  <section>
                    <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Appearance</h2>
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <p className="text-sm font-medium mb-4">Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'void'] as const).map(t => (
                          <button key={t} onClick={() => toggleTheme(t)} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                            <div className={`w-10 h-10 rounded-full mb-2 ${t === 'light' ? 'bg-[#FDFBF7]' : t === 'dark' ? 'bg-[#121212]' : 'bg-black border border-white/20'}`} />
                            <span className="text-xs font-medium capitalize">{t}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Danger Zone */}
                  <section>
                    <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h2>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text">Delete Account</p>
                        <p className="text-xs text-text-muted mt-1">This will permanently delete your account and all data.</p>
                      </div>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'overview' && <div className="text-center py-12 text-text-muted">Overview stats coming soon.</div>}
              
              {/* 🔥 Integrated Public Profile Settings */}
              {activeTab === 'public' && <PublicProfileSettings />}
              
            </motion.div>

          </div>
        </div>
      </main>

      {/* 🔥 Render the Modal */}
      {modalType && <AccountSettingsModal type={modalType} onClose={() => setModalType(null)} />}
    </div>
  );
}