import { Loop, Post } from '../types/Loop';
import { format, addDays, isBefore, parseISO } from 'date-fns';

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
  const availablePosts = loop.posts.filter(post => !isPostMuted(post));
  if (availablePosts.length === 0) return null;

  // Get the post at the current index, or wrap around to the beginning
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