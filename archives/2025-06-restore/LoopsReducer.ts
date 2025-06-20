import type { Loop } from '../types/loop';
import { deleteLoopFromList, togglePin } from '@/logic/loopManager';

export interface LoopsState {
  loops: Loop[];
}

export type LoopsAction =
  | { type: 'TOGGLE_ACTIVE'; payload: { loopId: string; isActive: boolean } }
  | { type: 'PIN'; payload: string }
  | { type: 'UNPIN'; payload: string }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_INITIAL_LOOPS'; payload: Loop[] }
  | { type: 'UPDATE_LOOP'; payload: Partial<Loop> & { id: string } }
  | { type: 'ADD_LOOP'; payload: Loop };

export const loopsReducer = (state: LoopsState, action: LoopsAction): LoopsState => {
  switch (action.type) {
    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.loopId
            ? { ...loop, isActive: action.payload.isActive, status: action.payload.isActive ? 'active' : 'paused' }
            : loop
        ),
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
    case 'ADD_LOOP':
      // The duplicated loop is created in the screen, here we just add it.
      return {
        ...state,
        loops: [action.payload, ...state.loops],
      };
    case 'SET_INITIAL_LOOPS':
      return {
        ...state,
        loops: action.payload,
      };
    case 'UPDATE_LOOP':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.id
            ? { ...loop, ...action.payload }
            : loop
        ),
      };
    default:
      return state;
  }
}; 