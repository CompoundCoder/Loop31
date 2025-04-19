import { Loop, Post } from '../types/Loop';
import { format, addDays, isBefore, parseISO, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to check if a post is currently muted
export const isPostMuted = (post: Post): boolean => {
  return !!(post.isMuted && post.mutedUntil && isBefore(new Date(), parseISO(post.mutedUntil)));
};

// Get the next post to use based on smart rotation logic
export const getNextPost = (loop: Loop): Post | null => {
  // First, check for any posts marked as "Post Next"
  const pinnedPost = loop.posts.find(post => 
    post.queueStatus === 'pinned' && !isPostMuted(post)
  );
  if (pinnedPost) return pinnedPost;

  // Filter out muted posts
  let availablePosts = loop.posts.filter(post => !isPostMuted(post));
  if (availablePosts.length === 0) return null;

  // Apply media settings if present
  if (loop.mediaSettings) {
    const { shuffle, avoidRecent, preferImages } = loop.mediaSettings;

    if (avoidRecent) {
      // TODO: If avoidRecent is true, filter out posts used in the last 7 days
      const sevenDaysAgo = subDays(new Date(), 7);
      availablePosts = availablePosts.filter(post => {
        if (!post.lastUsedDate) return true;
        return isBefore(new Date(post.lastUsedDate), sevenDaysAgo);
      });
    }

    if (preferImages) {
      // TODO: If preferImages is true, sort posts with mediaUri to the front
      availablePosts.sort((a, b) => {
        if (a.mediaUri && !b.mediaUri) return -1;
        if (!a.mediaUri && b.mediaUri) return 1;
        return 0;
      });
    }

    if (shuffle) {
      // TODO: If shuffle is true, randomly select from available posts
      // For now, just use a basic shuffle
      const randomIndex = Math.floor(Math.random() * availablePosts.length);
      return availablePosts[randomIndex];
    }
  }

  // Default to sequential rotation if no shuffle or no posts match criteria
  const nextIndex = loop.nextPostIndex % availablePosts.length;
  return availablePosts[nextIndex];
};

// Update post usage statistics and queue position
export const updatePostUsage = async (post: Post, loopName: string): Promise<Post> => {
  const now = new Date().toISOString();
  const history = post.history || [];
  
  return {
    ...post,
    timesUsed: (post.timesUsed || 0) + 1,
    lastUsedDate: now,
    queueStatus: post.queueStatus === 'pinned' ? 'normal' : post.queueStatus,
    history: [
      {
        date: now,
        event: 'posted',
        loopName
      },
      ...history
    ]
  };
};

// Calculate required posts based on schedule
export const calculateRequiredPosts = (loop: Loop): number => {
  if (loop.schedule.type === 'weekly' && loop.schedule.daysOfWeek) {
    return loop.schedule.daysOfWeek.length; // One post per scheduled day
  } else if (loop.schedule.type === 'interval' && loop.schedule.intervalDays) {
    return Math.ceil(7 / loop.schedule.intervalDays); // Posts needed for a week
  }
  return 0;
};

// Check loop integrity and get warning message if needed
export const checkLoopIntegrity = (loop: Loop): { hasWarning: boolean; message?: string } => {
  const requiredPosts = calculateRequiredPosts(loop);
  const activePosts = loop.posts.filter(post => !isPostMuted(post)).length;

  if (activePosts === 0) {
    return {
      hasWarning: true,
      message: 'All posts are currently muted. Add more posts or unmute existing ones.'
    };
  }

  if (activePosts < requiredPosts) {
    return {
      hasWarning: true,
      message: `This loop may run out of posts soon. Add more or adjust the schedule.`
    };
  }

  return { hasWarning: false };
};

// Remove a post from a loop while maintaining cross-loop integrity
export const removePostFromLoop = async (post: Post, loopId: string): Promise<void> => {
  try {
    const loopsJson = await AsyncStorage.getItem('loops');
    const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];

    // Update the post's linkedLoopIds
    const updatedLinkedLoopIds = (post.linkedLoopIds || []).filter(id => id !== loopId);
    const shouldMarkForDeletion = updatedLinkedLoopIds.length === 0;

    const updatedLoops = loops.map(loop => {
      if (loop.id === loopId) {
        // Remove post from this loop
        return {
          ...loop,
          posts: loop.posts.filter(p => p.id !== post.id),
        };
      } else if (post.linkedLoopIds?.includes(loop.id)) {
        // Update post in other linked loops
        return {
          ...loop,
          posts: loop.posts.map(p => {
            if (p.id === post.id) {
              return {
                ...p,
                linkedLoopIds: updatedLinkedLoopIds,
                isMarkedForDeletion: shouldMarkForDeletion,
              };
            }
            return p;
          }),
        };
      }
      return loop;
    });

    await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));

    // TODO: Implement storage cleanup for posts marked for deletion
    // This should be done periodically or during app startup
    if (shouldMarkForDeletion) {
      console.log(`Post ${post.id} marked for deletion - implement cleanup`);
    }
  } catch (error) {
    console.error('Error removing post:', error);
    throw error;
  }
};

// Update post content across all linked loops
export const updateLinkedPosts = async (post: Post, updates: Partial<Post>): Promise<void> => {
  try {
    const loopsJson = await AsyncStorage.getItem('loops');
    const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];

    const updatedLoops = loops.map(loop => {
      if (post.linkedLoopIds?.includes(loop.id)) {
        return {
          ...loop,
          posts: loop.posts.map(p => {
            if (p.id === post.id) {
              return {
                ...p,
                ...updates,
                linkedLoopIds: post.linkedLoopIds, // Preserve linking
              };
            }
            return p;
          }),
        };
      }
      return loop;
    });

    await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
  } catch (error) {
    console.error('Error updating linked posts:', error);
    throw error;
  }
};

// TODO: Future enhancements
/*
- Add support for loop-level media settings
  - Default aspect ratio (Square, Portrait, Story)
  - Image compression quality
  - Auto crop center point

- Add cross-loop syncing logic
  - Track dependencies between loops
  - Prevent scheduling conflicts
  - Manage shared media assets
*/ 