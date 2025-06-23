import { nanoid } from 'nanoid/non-secure';
import type { Loop } from '../types/loop';
import { v4 as uuidv4 } from 'uuid';
import type { Post } from '@/data/mockPosts';

/**
 * Generates a unique ID for a new loop.
 * We can replace this with a more robust ID generation strategy later.
 */
const generateUniqueId = (): string => {
  return nanoid();
};

/**
 * Duplicates a loop object, giving it a new ID and a "(Copy)" suffix.
 * This is a shallow copy and does NOT handle related posts.
 * @deprecated Use `duplicateLoopAndLinkPosts` for a complete duplication.
 */
export const duplicateLoop = (loop: Loop): Loop => {
  return {
    ...loop,
    id: uuidv4(),
    title: `${loop.title} (Copy)`,
  };
};

/**
 * Duplicates a loop and links all of its original posts to the new copy.
 * This is the centralized, correct way to duplicate a loop.
 * @param originalLoop The loop to duplicate.
 * @param allPosts The complete array of all posts in the application.
 * @returns The new loop object.
 */
export const duplicateLoopAndLinkPosts = (originalLoop: Loop, allPosts: Post[]): Loop => {
  const newLoop: Loop = {
    ...originalLoop,
    id: uuidv4(),
    title: `${originalLoop.title} (Copy)`,
  };

  const originalPosts = allPosts.filter(p => p.loopFolders?.includes(originalLoop.id));

  originalPosts.forEach(post => {
    post.loopFolders = [...(post.loopFolders || []), newLoop.id];
  });

  return newLoop;
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

/**
 * Finds posts that are unique to a given loop and marks them as soft-deleted.
 * This prevents posts from being orphaned when their only parent loop is deleted.
 * @param loopToDelete The loop that is about to be deleted.
 * @param allPosts The complete array of all posts in the application.
 */
export const deleteLoopAndPreservePosts = (loopToDelete: Loop, allPosts: Post[]): void => {
  const postsOnlyInThisLoop = allPosts.filter(p => 
    p.loopFolders?.includes(loopToDelete.id) && p.loopFolders.length === 1
  );

  postsOnlyInThisLoop.forEach(post => {
    // Find the actual post in the store to mutate it
    const postInStore = allPosts.find(p => p.id === post.id);
    if (postInStore) {
      postInStore.deletedAt = new Date().toISOString();
      postInStore.deletedFromLoopId = loopToDelete.id;
      postInStore.loopFolders = []; // It is now orphaned/soft-deleted
    }
  });
}; 