/**
 * Hook to access the app state
 */

import { useContext } from 'react';
import { AppContext } from './context';
import type { AppState } from './types';

/**
 * Hook to access the app state
 * @throws Error if used outside of AppProvider
 */
export function useAppState(): AppState {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  
  return context;
}
