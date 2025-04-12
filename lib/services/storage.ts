import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, Platform } from '../types';

const POSTS_STORAGE_KEY = '@Loop31:posts';

export interface StorageService {
  getPosts(): Promise<Post[]>;
  savePost(post: Post): Promise<void>;
  updatePost(post: Post): Promise<void>;
  deletePost(postId: string): Promise<void>;
  getPostsByPlatform(platform: Platform): Promise<Post[]>;
  getScheduledPosts(): Promise<Post[]>;
  getDraftPosts(): Promise<Post[]>;
}

class LocalStorageService implements StorageService {
  async getPosts(): Promise<Post[]> {
    try {
      const postsJson = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async savePost(post: Post): Promise<void> {
    try {
      const posts = await this.getPosts();
      posts.push(post);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  async updatePost(post: Post): Promise<void> {
    try {
      const posts = await this.getPosts();
      const index = posts.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts[index] = post;
        await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
      }
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const posts = await this.getPosts();
      const filteredPosts = posts.filter(post => post.id !== postId);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getPostsByPlatform(platform: Platform): Promise<Post[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(post => post.platforms.includes(platform));
    } catch (error) {
      console.error('Error getting posts by platform:', error);
      return [];
    }
  }

  async getScheduledPosts(): Promise<Post[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(post => post.status === 'scheduled');
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      return [];
    }
  }

  async getDraftPosts(): Promise<Post[]> {
    try {
      const posts = await this.getPosts();
      return posts.filter(post => post.status === 'draft');
    } catch (error) {
      console.error('Error getting draft posts:', error);
      return [];
    }
  }
}

export const storageService = new LocalStorageService(); 