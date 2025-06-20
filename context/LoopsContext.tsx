import React, { createContext, useReducer, useContext, type ReactNode, type Dispatch } from 'react';
import { loopsReducer, type LoopsState, type LoopsAction } from './LoopsReducer';
import type { Loop } from '../types/loop';
import { MOCK_POSTS } from '@/data/mockPosts';

// --- Initial Mock Data ---
const initialMockLoopsData: Loop[] = [
  { id: 'auto-listing', title: 'Auto-Listing Loop', color: '#888888', isActive: false, isPinned: false, postCount: 0, status: 'paused', frequency: 'daily_1x', schedule: '', previewImageUrl: MOCK_POSTS[0].imageUrl },
  { id: 'p1', title: 'Core Content Loop', color: '#FF6B6B', isActive: true, isPinned: true, postCount: 0, status: 'active', frequency: 'daily_1x', schedule: '', previewImageUrl: MOCK_POSTS[1].imageUrl },
  { id: 'p2', title: 'Community Engagement', color: '#45B7D1', isActive: false, isPinned: false, postCount: 0, status: 'paused', frequency: 'daily_1x', schedule: '', previewImageUrl: MOCK_POSTS[2].imageUrl },
  { id: 'f1', title: 'Tuesday Tips', color: '#4ECDC4', isActive: true, isPinned: false, postCount: 0, status: 'active', frequency: 'weekly_1x', schedule: '', previewImageUrl: MOCK_POSTS[3].imageUrl },
  { id: 'f2', title: 'Market Updates', color: '#FFA07A', isActive: true, isPinned: false, postCount: 0, status: 'active', frequency: 'weekly_3x', schedule: '', previewImageUrl: MOCK_POSTS[4].imageUrl },
  { id: 'f3', title: 'Testimonials', color: '#96CEB4', isActive: false, isPinned: true, postCount: 0, status: 'paused', frequency: 'weekly_5x', schedule: '', previewImageUrl: MOCK_POSTS[0].imageUrl },
];


// --- Initial Reducer State ---
const initialState: LoopsState = {
  loops: initialMockLoopsData,
};

// --- Context Definition ---
interface LoopsContextType {
  state: LoopsState;
  dispatch: Dispatch<LoopsAction>;
}

const LoopsContext = createContext<LoopsContextType | undefined>(undefined);

// --- Provider Component ---
interface LoopsProviderProps {
  children: ReactNode;
}

export const LoopsProvider: React.FC<LoopsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loopsReducer, initialState);

  return (
    <LoopsContext.Provider value={{ state, dispatch }}>
      {children}
    </LoopsContext.Provider>
  );
};

// --- Custom Hook for easy consumption ---
export const useLoops = (): LoopsContextType => {
  const context = useContext(LoopsContext);
  if (context === undefined) {
    throw new Error('useLoops must be used within a LoopsProvider');
  }
  return context;
};

// --- Re-export Loop type for convenience ---
export type { Loop }; 