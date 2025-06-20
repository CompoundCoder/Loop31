import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from '@/data/Post';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const usePostEditor = (initialLoopId?: string) => {
  const [postId, setPostId] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [loopId, setLoopId] = useState<string | undefined>(initialLoopId);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia([result.assets[0].uri]);
    }
  }, []);

  const resetEditor = useCallback((post?: Post) => {
    setPostId(post?.id || null);
    setCaption(post?.caption || '');
    setMedia(post?.media ? [...post.media] : []);
    setLoopId(post?.loopFolders?.[0] || initialLoopId);
  }, [initialLoopId]);

  const savePost = useCallback(async () => {
    console.log('Attempting to save post with loopId:', loopId);
    if (media.length === 0 || !caption.trim()) {
      Alert.alert('Missing Info', 'Please provide an image and a caption.');
      return false;
    }

    try {
      const allPostsString = await AsyncStorage.getItem('posts');
      const allPostsData: Partial<Post>[] = allPostsString ? JSON.parse(allPostsString) : [];
      const allPosts = allPostsData.map((p: Partial<Post>) => new Post({ ...p, id: p.id || uuidv4() }));

      if (postId) {
        const postToUpdate = allPosts.find(p => p.id === postId);
        if (postToUpdate) {
          postToUpdate.updateCaption(caption.trim());
          postToUpdate.media.forEach((uri: string) => postToUpdate.removeMedia(uri));
          postToUpdate.addMedia(media[0]);
        } else {
          Alert.alert('Error', 'Post not found for updating.');
          return false;
        }

        await AsyncStorage.setItem('posts', JSON.stringify(allPosts.map((p: Post) => p.toJSON())));
        Alert.alert('Post Updated', 'Your post has been saved successfully.');
      } else {
        if (!loopId) {
          Alert.alert('Error', 'A Loop ID is required to create a post. Please try again.');
          return false;
        }
        const newPost = new Post({
          id: uuidv4(),
          caption: caption.trim(),
          media: media,
          loopFolders: [loopId],
        });
        
        allPosts.push(newPost);
        await AsyncStorage.setItem('posts', JSON.stringify(allPosts.map((p: Post) => p.toJSON())));
        Alert.alert('Post Created', 'Your new post has been saved.');
      }
      resetEditor();
      return true;
    } catch (error) {
      console.error('Failed to save post:', error);
      Alert.alert('Error', 'Failed to save the post.');
      return false;
    }
  }, [postId, caption, media, loopId]);

  return {
    caption,
    setCaption,
    media,
    setMedia,
    handlePickImage,
    savePost,
    resetEditor,
  };
}; 