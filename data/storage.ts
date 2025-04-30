import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from './Post';

const POSTS_STORAGE_KEY = '@loop31_posts';

type StoredPostData = {
  id: string;
  caption: string;
  media: string[];
  scheduledDate: string | null;
  scheduledTimeOfDay: 'morning' | 'noon' | 'evening' | null;
  accountTargets: string[];
  loopFolders?: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'deleted';
};

export async function savePost(post: Post): Promise<void> {
  try {
    const existingPosts = await getAllPosts();
    const posts = [...existingPosts, post];
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    throw new Error(`Failed to save post: ${error}`);
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const postsJson = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
    if (!postsJson) return [];

    const postsData = JSON.parse(postsJson) as StoredPostData[];
    return postsData.map(data => {
      const post = new Post({ id: data.id });
      return Object.assign(post, data);
    });
  } catch (error) {
    throw new Error(`Failed to load posts: ${error}`);
  }
}

export async function updatePost(post: Post): Promise<void> {
  try {
    const posts = await getAllPosts();
    const index = posts.findIndex(p => p.id === post.id);
    
    if (index === -1) {
      throw new Error(`Post with id ${post.id} not found`);
    }

    posts[index] = post;
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    throw new Error(`Failed to update post: ${error}`);
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const posts = await getAllPosts();
    const filteredPosts = posts.filter(post => post.id !== postId);
    await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
  } catch (error) {
    throw new Error(`Failed to delete post: ${error}`);
  }
}

export async function clearAllPosts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(POSTS_STORAGE_KEY);
  } catch (error) {
    throw new Error(`Failed to clear posts: ${error}`);
  }
} 