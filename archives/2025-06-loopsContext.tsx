import React, { createContext, useReducer, useContext, type ReactNode, type Dispatch } from 'react';
import { ImageSourcePropType } from 'react-native';
import { MOCK_POSTS } from '@/data/mockPosts'; // Import dependency for initial data
import { POST_FREQUENCIES } from '@/constants/loopFrequencies';
import { deleteLoopFromList, togglePin } from '@/logic/loopManager';

// --- Define Loop Interface ---
// (Moved from app/loops/index.tsx)
export interface Loop {
  id: string;
  title: string;
  color: string;
  isActive: boolean;
  isPinned: boolean;
  postCount?: number;
  status?: 'active' | 'paused' | 'draft' | 'error';
  previewImageUrl?: string; // Optional preview image URL
  frequency?: string;
  schedule?: string; // e.g., "mon,wed,fri" for custom schedules
  randomize?: boolean;
  linkedAccounts?: string[];
}

// Define PostDisplayData interface for LoopDetailsScreen consumption
export interface PostDisplayData {
  id: string;
  caption: string;
  imageSource: ImageSourcePropType; // For TestPostCardMini
}

// --- Reducer State ---
// (Moved from app/loops/index.tsx)
export interface LoopsState {
  loops: Loop[];
}

// --- Action Types ---
// (Moved from app/loops/index.tsx)
export type LoopsAction =
  | { type: 'TOGGLE_ACTIVE'; payload: { loopId: string; isActive: boolean } }
  | { type: 'PIN'; payload: string } // loopId
  | { type: 'UNPIN'; payload: string } // loopId
  | { type: 'DELETE'; payload: string } // loopId
  | { type: 'SET_INITIAL_LOOPS'; payload: Loop[] }
  | { type: 'UPDATE_LOOP'; payload: Partial<Loop> & { id: string } } // For future editing
  | { type: 'ADD_LOOP'; payload: Loop } // For future creation
  | { type: 'UPDATE_LOOP_POSTS'; payload: { loopId: string; newPosts: PostDisplayData[] } }; // New action

// --- Initial Mock Data ---
// (Moved from app/loops/index.tsx)
const initialMockLoopsData: Loop[] = [
  { id: 'auto-listing', title: 'Auto-Listing Loop', color: '#888888', isActive: false, isPinned: false, status: 'paused', previewImageUrl: MOCK_POSTS[0].imageUrl, frequency: 'daily_1x', randomize: false, linkedAccounts: [] },
  { id: 'p1', title: 'Core Content Loop', color: '#FF6B6B', isActive: true, isPinned: true, status: 'active', previewImageUrl: MOCK_POSTS[1].imageUrl, frequency: 'daily_1x', randomize: true, linkedAccounts: ['twitter', 'linkedin'] },
  { id: 'p2', title: 'Community Engagement', color: '#45B7D1', isActive: false, isPinned: false, status: 'paused', previewImageUrl: MOCK_POSTS[2].imageUrl, frequency: 'daily_1x', randomize: false, linkedAccounts: ['facebook'] },
  { id: 'f1', title: 'Tuesday Tips', color: '#4ECDC4', isActive: true, isPinned: false, status: 'active', previewImageUrl: MOCK_POSTS[3].imageUrl, frequency: 'weekly_1x', randomize: false, linkedAccounts: ['instagram'] },
  { id: 'f2', title: 'Market Updates', color: '#FFA07A', isActive: true, isPinned: false, status: 'active', previewImageUrl: MOCK_POSTS[4].imageUrl, frequency: 'weekly_3x', randomize: true, linkedAccounts: ['linkedin'] },
  { id: 'f3', title: 'Testimonials', color: '#96CEB4', isActive: false, isPinned: false, status: 'paused', previewImageUrl: MOCK_POSTS[0].imageUrl, frequency: 'weekly_5x', randomize: false, linkedAccounts: ['facebook', 'instagram'] },
];

// --- Initial Reducer State ---
// (Moved from app/loops/index.tsx)
const initialState: LoopsState = {
  loops: initialMockLoopsData,
};

// --- Reducer Function ---
// (Moved from app/loops/index.tsx)
const loopsReducer = (state: LoopsState, action: LoopsAction): LoopsState => {
  switch (action.type) {
    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.loopId
            ? { ...loop, isActive: action.payload.isActive, status: action.payload.isActive ? 'active' : 'paused' }
            : loop
        )
      };
    case 'PIN':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload ? togglePin(loop, true) : loop
        ),
      };
    case 'UNPIN':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload ? togglePin(loop, false) : loop
        ),
      };
    case 'DELETE':
      return {
        ...state,
        loops: deleteLoopFromList(state.loops, action.payload),
      };
    case 'SET_INITIAL_LOOPS': // For future use with API
      return {
        ...state,
        loops: action.payload,
      };
    case 'UPDATE_LOOP':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.id
            ? { ...loop, ...action.payload } // Merge updates into the found loop
            : loop
        ),
      };
    case 'UPDATE_LOOP_POSTS': // Handle new action
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.loopId
            ? { ...loop, posts: action.payload.newPosts, postCount: action.payload.newPosts.length }
            : loop
        ),
      };
    case 'ADD_LOOP':
      return {
        ...state,
        loops: [{ ...action.payload, isPinned: false }, ...state.loops],
      };
    default:
      // Ensure exhaustive check if needed, or return state
      return state;
  }
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