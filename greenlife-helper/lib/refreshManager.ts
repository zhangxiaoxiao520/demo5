'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  useEffect(() => {
    const handleGlobalRefresh = (event: CustomEvent) => {
      const { type } = event.detail;
      if (type === 'postDeleted' || type === 'commentDeleted') {
        triggerRefresh();
      }
    };
    
    window.addEventListener('appRefresh', handleGlobalRefresh as EventListener);
    return () => {
      window.removeEventListener('appRefresh', handleGlobalRefresh as EventListener);
    };
  }, []);
  
  // 使用React.createElement而不是JSX语法
  return React.createElement(RefreshContext.Provider, { value: { refreshKey, triggerRefresh } }, children);
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}