import { nanoid } from 'nanoid/non-secure';
import type { Loop } from '../types/loop';

/**
 * Generates a unique ID for a new loop.
 * We can replace this with a more robust ID generation strategy later.
 */
const generateUniqueId = (): string => {
  return nanoid();
};

/**
 * Creates a duplicate of a given loop with a new ID and modified title.
 * The duplicated loop is always unpinned by default.
 *
 * @param original - The loop object to duplicate.
 * @returns A new loop object that is a copy of the original.
 */
export const duplicateLoop = (original: Loop): Loop => {
  return {
    ...original,
    id: generateUniqueId(),
    title: `${original.title} (Copy)`,
    isPinned: false,
  };
};

/**
 * Toggles the pinned state of a loop.
 *
 * @param loop - The loop to update.
 * @param shouldPin - A boolean indicating whether the loop should be pinned or unpinned.
 * @returns A new loop object with the updated `isPinned` state.
 */
export const togglePin = (loop: Loop, shouldPin: boolean): Loop => {
  return {
    ...loop,
    isPinned: shouldPin,
  };
};

/**
 * Deletes a loop from an array of loops by its ID.
 *
 * @param loops - The array of loops.
 * @param loopId - The ID of the loop to delete.
 * @returns A new array with the specified loop removed.
 */
export const deleteLoopFromList = (loops: Loop[], loopId: string): Loop[] => {
  return loops.filter(loop => loop.id !== loopId);
};

/**
 * Updates a specific loop within an array of loops.
 *
 * @param loops - The array of loops.
 * @param updatedLoop - The loop object containing the new data.
 * @returns A new array with the updated loop.
 */
export const updateLoopInList = (loops: Loop[], updatedLoop: Loop): Loop[] => {
  return loops.map(loop => (loop.id === updatedLoop.id ? updatedLoop : loop));
}; 