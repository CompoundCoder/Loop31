import { useMemo } from 'react';
// Assuming the Loop type is exported from your LoopsContext
// Adjust the import path if your Loop type is defined elsewhere or named differently
import type { Loop } from '@/context/LoopsContext';

/**
 * Custom hook to create a memoized Map of loops from an array.
 * The Map keys are loop IDs, and values are the loop objects.
 *
 * @param allLoops - An array of Loop objects.
 * @returns A memoized Map<string, Loop>.
 */
export const useLoopMap = (allLoops: Loop[]): Map<string, Loop> => {
  const loopMap = useMemo(() => {
    const map = new Map<string, Loop>();
    if (allLoops) {
      for (const loop of allLoops) {
        map.set(loop.id, loop);
      }
    }
    return map;
  }, [allLoops]);

  return loopMap;
}; 