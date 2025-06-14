import type { Post } from '@/data/mockPosts';

/**
 * Calculates the number of posts associated with a specific loop.
 * @param loopId The ID of the loop.
 * @param posts An array of all post objects.
 * @returns The number of posts that belong to the given loop.
 */
export const getLoopPostCount = (
  loopId: string,
  posts: Post[]
): number => {
  if (!loopId || !posts) {
    return 0;
  }

  return posts.filter(post => post.loopFolders?.includes(loopId)).length;
}; 