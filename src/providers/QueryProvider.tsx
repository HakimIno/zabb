import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { focusManager, onlineManager } from '@tanstack/react-query';

// Setup for React Native as per TanStack Query docs
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
