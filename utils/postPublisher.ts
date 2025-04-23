import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Loop as BaseLoop, Post as LoopPost } from '../types/Loop';

interface BasePost {
  id: string;
  caption: string;
  mediaUri: string;
  platforms: string[];
  createdAt: string;
  timesUsed?: number;
  lastUsedDate?: string;
  isMuted?: boolean;
  linkedLoopIds?: string[];
  folder?: string;
}

interface Post extends BasePost {
  scheduledDate?: string;
}

interface Loop extends BaseLoop {
  nextPostAt?: string;
}

interface PublishedPostBase extends BasePost {
  postedAt: string;
  isPosted: true;
  platforms: string[];
}

interface LoopPublishedPost extends PublishedPostBase {
  source: 'loop';
  loopId: string;
}

interface ScheduledPublishedPost extends PublishedPostBase {
  source: 'schedule';
}

type AnyPublishedPost = LoopPublishedPost | ScheduledPublishedPost;

/**
 * Utility function to introduce a delay
 * @param ms Time to sleep in milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Checks for and publishes all posts that are due
 * @returns Promise that resolves when all due posts are processed
 */
export async function checkAndPublishDuePosts(): Promise<void> {
  try {
    // Load scheduled posts
    const scheduledPostsJson = await AsyncStorage.getItem('scheduledPosts');
    if (!scheduledPostsJson) {
      console.log('No scheduled posts found');
      return;
    }

    const scheduledPosts: Post[] = JSON.parse(scheduledPostsJson);
    const now = new Date().getTime();
    
    // Filter posts that are due
    const duePosts = scheduledPosts.filter(post => {
      if (!post.scheduledDate) return false;
      const scheduledTime = new Date(post.scheduledDate).getTime();
      return scheduledTime <= now;
    });

    if (duePosts.length === 0) {
      console.log('No posts due for publishing');
      return;
    }

    console.log(`Found ${duePosts.length} posts due for publishing`);

    // Publish each due post
    const results = await Promise.allSettled(
      duePosts.map(async (post) => {
        try {
          await publishPost(post);
          return { success: true, id: post.id };
        } catch (error) {
          console.error(`Failed to publish post ${post.id}:`, error);
          return { success: false, id: post.id, error };
        }
      })
    );

    // Log results
    const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.filter(r => r.status === 'rejected' || !(r.status === 'fulfilled' && (r.value as any).success)).length;
    
    console.log(`Published ${succeeded} posts, ${failed} failed`);
  } catch (error) {
    console.error('Error in checkAndPublishDuePosts:', error);
    // Don't throw error to prevent breaking the app flow
  }
}

/**
 * Publishes a post by moving it from scheduled to published posts
 * @param post The post to publish
 * @param delayMs Optional delay before publishing (in milliseconds)
 * @returns Promise that resolves when the post is published
 */
export async function publishPost(post: Post, delayMs?: number): Promise<void> {
  try {
    // Log folder information if it exists
    if (post.folder) {
      console.log('Publishing from folder:', post.folder);
    }

    // Apply optional delay if specified
    if (delayMs && delayMs > 0) {
      await sleep(delayMs);
    }

    // Load existing published posts
    const publishedPostsJson = await AsyncStorage.getItem('publishedPosts');
    const publishedPosts: Post[] = publishedPostsJson ? JSON.parse(publishedPostsJson) : [];

    // Check for duplicate post
    const isDuplicate = publishedPosts.some(p => p.id === post.id);
    if (isDuplicate) {
      console.log(`Post ${post.id} already published, skipping`);
      return;
    }

    // Create new published post (without mutating original)
    const publishedPost = {
      ...post,
      publishedAt: new Date().toISOString(),
      // Only remove scheduledDate from the published copy
      scheduledDate: undefined
    };

    // TODO: Send post to external API (e.g. Facebook, Instagram)

    // Add to start of published posts array
    publishedPosts.unshift(publishedPost);

    // Save updated published posts
    await AsyncStorage.setItem('publishedPosts', JSON.stringify(publishedPosts));

    // Remove from scheduled posts if it exists there
    const scheduledPostsJson = await AsyncStorage.getItem('scheduledPosts');
    if (scheduledPostsJson) {
      const scheduledPosts: Post[] = JSON.parse(scheduledPostsJson);
      const updatedScheduledPosts = scheduledPosts.filter(p => p.id !== post.id);
      await AsyncStorage.setItem('scheduledPosts', JSON.stringify(updatedScheduledPosts));
    }

    console.log(`Successfully published post ${post.id}`);
  } catch (error) {
    console.error('Error publishing post:', error);
    throw new Error(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface ScheduledPost {
  id: string;
  caption: string;
  mediaUri: string;
  platforms: string[];
  scheduledDate: string;
  createdAt: string;
}

interface PublishedPost extends Omit<ScheduledPost, 'scheduledDate'> {
  postedAt: string;
  source: 'schedule';
}

const SCHEDULED_POSTS_KEY = 'scheduledPosts';
const PUBLISHED_POSTS_KEY = 'publishedPosts';

export async function processScheduledPosts(): Promise<void> {
  try {
    // Load scheduled posts
    const scheduledPostsJson = await AsyncStorage.getItem(SCHEDULED_POSTS_KEY);
    if (!scheduledPostsJson) {
      console.log('No scheduled posts found');
      return;
    }

    const scheduledPosts: ScheduledPost[] = JSON.parse(scheduledPostsJson);
    const now = new Date();
    
    // Separate posts into due and pending
    const { duePosts, pendingPosts } = scheduledPosts.reduce(
      (acc, post) => {
        const scheduledDate = new Date(post.scheduledDate);
        if (scheduledDate <= now) {
          // Convert to published post format with new metadata
          const publishedPost: ScheduledPublishedPost = {
            id: post.id,
            caption: post.caption,
            mediaUri: post.mediaUri,
            platforms: ['facebook'], // placeholder for now
            createdAt: post.createdAt,
            postedAt: new Date().toISOString(),
            source: 'schedule',
            isPosted: true
          };
          acc.duePosts.push(publishedPost);
        } else {
          acc.pendingPosts.push(post);
        }
        return acc;
      },
      { duePosts: [] as ScheduledPublishedPost[], pendingPosts: [] as ScheduledPost[] }
    );

    if (duePosts.length === 0) {
      console.log('No posts due for publishing');
      return;
    }

    // Load existing published posts
    const publishedPostsJson = await AsyncStorage.getItem(PUBLISHED_POSTS_KEY);
    const existingPublishedPosts: PublishedPost[] = publishedPostsJson 
      ? JSON.parse(publishedPostsJson)
      : [];

    // Update both storage locations
    await Promise.all([
      // Save updated scheduled posts
      AsyncStorage.setItem(SCHEDULED_POSTS_KEY, JSON.stringify(pendingPosts)),
      
      // Add new published posts to existing ones
      AsyncStorage.setItem(
        PUBLISHED_POSTS_KEY, 
        JSON.stringify([...existingPublishedPosts, ...duePosts])
      )
    ]);

    console.log(`Successfully published ${duePosts.length} posts`);
    console.log('Published post IDs:', duePosts.map(post => post.id).join(', '));
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
    throw new Error('Failed to process scheduled posts');
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LOOPS_KEY = 'loops';

/**
 * Process all active loops and publish posts that are due
 */
export async function processLoopPosts(): Promise<void> {
  try {
    // Load all loops
    const loopsJson = await AsyncStorage.getItem(LOOPS_KEY);
    if (!loopsJson) {
      console.log('No loops found');
      return;
    }

    const loops: Loop[] = JSON.parse(loopsJson);
    const activeLoops = loops.filter(loop => loop.isActive);
    
    if (activeLoops.length === 0) {
      console.log('No active loops found');
      return;
    }

    const now = new Date();
    const loopsToUpdate: Loop[] = [];
    const postsToPublish: LoopPublishedPost[] = [];

    // Process each active loop
    for (const loop of activeLoops) {
      try {
        if (!loop.posts || loop.posts.length === 0) {
          console.log(`Loop ${loop.id} has no posts, skipping`);
          continue;
        }

        const nextPostTime = loop.nextPostAt ? new Date(loop.nextPostAt) : null;
        if (!nextPostTime || nextPostTime > now) {
          continue;
        }

        // Select next post (for now, just use the first non-muted post)
        const availablePosts = loop.posts.filter(post => !post.isMuted);
        if (availablePosts.length === 0) {
          console.log(`Loop ${loop.id} has no available posts, skipping`);
          continue;
        }

        const selectedPost = availablePosts[0];

        // Create published post with new metadata
        const publishedPost: LoopPublishedPost = {
          ...selectedPost,
          postedAt: now.toISOString(),
          source: 'loop',
          loopId: loop.id,
          linkedLoopIds: selectedPost.linkedLoopIds,
          platforms: ['facebook'], // placeholder for now
          isPosted: true
        };

        // Update post metadata
        selectedPost.timesUsed = (selectedPost.timesUsed || 0) + 1;
        selectedPost.lastUsedDate = now.toISOString();

        // Update loop metadata
        loop.nextPostAt = new Date(now.getTime() + ONE_DAY_MS).toISOString();
        
        loopsToUpdate.push(loop);
        postsToPublish.push(publishedPost);
        
        console.log(`Prepared post ${selectedPost.id} from loop ${loop.id} for publishing`);
      } catch (error) {
        console.error(`Error processing loop ${loop.id}:`, error);
        // Continue with other loops
      }
    }

    if (postsToPublish.length === 0) {
      console.log('No loop posts ready for publishing');
      return;
    }

    // Load existing published posts
    const publishedPostsJson = await AsyncStorage.getItem(PUBLISHED_POSTS_KEY);
    const existingPublishedPosts = publishedPostsJson ? JSON.parse(publishedPostsJson) : [];

    // Update storage atomically
    await Promise.all([
      // Update loops with new metadata
      AsyncStorage.setItem(LOOPS_KEY, JSON.stringify(loops)),
      
      // Add new published posts
      AsyncStorage.setItem(
        PUBLISHED_POSTS_KEY,
        JSON.stringify([...postsToPublish, ...existingPublishedPosts])
      )
    ]);

    console.log(`Successfully published ${postsToPublish.length} loop posts`);
    console.log('Updated loops:', loopsToUpdate.map(loop => loop.id).join(', '));
  } catch (error) {
    console.error('Error processing loop posts:', error);
    throw new Error('Failed to process loop posts');
  }
}

/**
 * Process both scheduled and loop posts
 */
export async function processAllPosts(): Promise<void> {
  try {
    await Promise.all([
      processScheduledPosts(),
      processLoopPosts()
    ]);
    console.log('Completed processing all posts');
  } catch (error) {
    console.error('Error processing all posts:', error);
    throw new Error('Failed to process all posts');
  }
} 