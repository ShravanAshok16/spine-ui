import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { User, Settings as SettingsIcon, Shield, Bell, ChevronRight, Lock, BookOpen, Flame, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { PublicProfileSettings } from '../components/PublicProfileSettings';
import { getMyLibrary, getSessionStats } from '../api/library';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'public' | 'settings'>('settings');
  const [modalType, setModalType] = useState<'profile' | 'email' | 'password' | null>(null);

  // 🔥 Fetch data for the Overview tab
  const { data: books = [] } = useQuery({ queryKey: ['library'], queryFn: getMyLibrary });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessionStats'], queryFn: getSessionStats });

  const totalBooks = books.length;
  const finishedBooks = books.filter(b => b.status === 'Finished').length;
  const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const activeDays = sessions.filter(s => s.pagesRead > 0).length;

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

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Tabs */}
            <div className="flex border-b border-border mb-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}>
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              {/* 🔥 OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold font-serif flex-shrink-0">
                      {user?.displayName?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-text">{user?.displayName}</h2>
                      <p className="text-sm text-text-muted mt-1">{user?.email}</p>
                      <p className="text-xs text-primary mt-2 font-medium">Member since 2026</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
                      <p className="text-2xl font-bold font-serif">{totalBooks}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Books</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <Shield className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-2xl font-bold font-serif">{finishedBooks}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Finished</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <Clock className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-2xl font-bold font-serif">{totalPagesRead}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Pages Read</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <Flame className="w-6 h-6 text-orange-500 mb-2" />
                      <p className="text-2xl font-bold font-serif">{activeDays}</p>
                      <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Active Days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔥 PUBLIC TAB */}
              {activeTab === 'public' && <PublicProfileSettings />}
              
              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Account</h2>
                    <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
                      
                      <button onClick={() => setModalType('profile')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-text-muted" />
                          <span>Profile & Phone</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </button>

                      <button onClick={() => setModalType('email')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-text-muted" />
                          <span>Email</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <span className="hidden sm:inline">{user?.email}</span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </button>

                      <button onClick={() => setModalType('password')} className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-text-muted" />
                          <span>Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted" />
                      </button>

                    </div>
                  </section>

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
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </main>

      {modalType && <AccountSettingsModal type={modalType} onClose={() => setModalType(null)} />}
    </div>
  );
}