import type { Loop } from '../types/loop';
import { deleteLoopFromList, togglePin, updateLoopInList } from '@/logic/loopManager';

export interface LoopsState {
  loops: Loop[];
}

export type LoopsAction =
  | { type: 'ADD_LOOP'; payload: Loop }
  | { type: 'DELETE'; payload: string }
  | { type: 'PIN'; payload: string }
  | { type: 'UNPIN'; payload: string }
  | { type: 'UPDATE_LOOP'; payload: Loop }
  | { type: 'TOGGLE_ACTIVE'; payload: { loopId: string; isActive: boolean } };

export const loopsReducer = (state: LoopsState, action: LoopsAction): LoopsState => {
  switch (action.type) {
    case 'ADD_LOOP':
      return {
        ...state,
        loops: [action.payload, ...state.loops],
      };
    case 'DELETE':
      return {
        ...state,
        loops: deleteLoopFromList(state.loops, action.payload),
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
    case 'UPDATE_LOOP':
      return {
        ...state,
        loops: updateLoopInList(state.loops, action.payload),
      };
    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        loops: state.loops.map(loop =>
          loop.id === action.payload.loopId
            ? { ...loop, isActive: action.payload.isActive, status: action.payload.isActive ? 'active' : 'paused' }
            : loop
        ),
      };
    default:
      return state;
  }
}; 