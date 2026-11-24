import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import { PageTransition } from './components/PageTransition';
import { FloatingAddButton } from './components/FloatingAddButton';
import { AddBookModal } from './components/AddBookModal';
import { MobileNav } from './components/MobileNav';
import { CommandPalette } from './components/CommandPalette'; // 🔥 Added Import

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Discover from './pages/Discover';
import BookDetails from './pages/BookDetails';
import ForYou from './pages/ForYou';
import Settings from './pages/Settings'; 
import type { ReactNode } from 'react';
import PublicProfile from './pages/PublicProfile';
import Feed from './pages/Feed';
import Friends from './pages/Friends';
import Stats from './pages/Stats';
import Wrapped from './pages/Wrapped';

function GlobalModals() {
  const { isAddModalOpen, closeAddModal } = useUI();
  return <AddBookModal isOpen={isAddModalOpen} onClose={closeAddModal} />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  
  return (
    <>
      {children}
      <MobileNav />
      <FloatingAddButton />
      <GlobalModals />
      <CommandPalette /> {/* 🔥 Added Here */}
    </>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <UIProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><PageTransition><Library /></PageTransition></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><PageTransition><Discover /></PageTransition></ProtectedRoute>} />
          <Route path="/books/:id" element={<ProtectedRoute><PageTransition><BookDetails /></PageTransition></ProtectedRoute>} />
          <Route path="/for-you" element={<ProtectedRoute><PageTransition><ForYou /></PageTransition></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><PageTransition><Friends /></PageTransition></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><PageTransition><Feed /></PageTransition></ProtectedRoute>} />
          <Route path="/u/:username" element={<ProtectedRoute><PageTransition><PublicProfile /></PageTransition></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><PageTransition><Stats /></PageTransition></ProtectedRoute>} />
          <Route path="/wrapped" element={<ProtectedRoute><PageTransition><Wrapped /></PageTransition></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </UIProvider>
  );
}