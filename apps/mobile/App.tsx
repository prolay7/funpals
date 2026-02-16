/**
 * App.tsx — Funpals React Native root component.
 * Wraps the app in Redux Provider and Navigation Container.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </Provider>
  );
}
