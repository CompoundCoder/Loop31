import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Post {
  id: string;
  caption: string;
  media?: string[];
  mediaUri?: string;
  platforms: string[];
  folder?: string;
  scheduledDate?: string;
  publishedAt?: string;
}

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
    // Log folder information
    console.log('Publishing from folder:', post.folder || 'N/A');

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