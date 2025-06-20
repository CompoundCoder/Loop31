import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from '@/data/Post';
import { MOCK_POSTS } from '@/data/mockPosts';

const POSTS_STORAGE_KEY = '@posts';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
        if (storedPosts) {
          const parsedPosts = JSON.parse(storedPosts).map((p: any) => new Post(p));
          setPosts(parsedPosts);
          // Also update the mock array for any components still using it directly
          MOCK_POSTS.length = 0;
          MOCK_POSTS.push(...parsedPosts);
        }
      } catch (error) {
        console.error("Failed to load posts from storage", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPosts();
  }, []);

  const addPost = useCallback(async (newPost: Post) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    
    // Update the mock array for instant UI updates in legacy components
    MOCK_POSTS.length = 0;
    MOCK_POSTS.push(...updatedPosts);
    
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts.map(p => p.toJSON())));
    } catch (error) {
      console.error("Failed to save post to storage", error);
    }
  }, [posts]);

  return { posts, addPost, isLoaded };
}; 