import { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      isAddModalOpen,
      openAddModal: () => setIsAddModalOpen(true),
      closeAddModal: () => setIsAddModalOpen(false)
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}