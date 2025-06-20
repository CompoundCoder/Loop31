import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Loop } from '@/types/loop';
import type { Post } from '@/data/mockPosts';

const RECENTLY_DELETED_KEY = 'recently_deleted_items';

export interface DeletedItem<T> {
  item: T;
  deletedAt: string; // ISO string format
}

export interface RecentlyDeletedStore {
  loops: DeletedItem<Loop>[];
  posts: DeletedItem<Post>[];
}

const getStore = async (): Promise<RecentlyDeletedStore> => {
  try {
    const jsonValue = await AsyncStorage.getItem(RECENTLY_DELETED_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : { loops: [], posts: [] };
  } catch (e) {
    console.error('Error reading recently deleted store:', e);
    return { loops: [], posts: [] };
  }
};

const saveStore = async (store: RecentlyDeletedStore): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(store);
    await AsyncStorage.setItem(RECENTLY_DELETED_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving recently deleted store:', e);
  }
};

export const addLoopToRecentlyDeleted = async (loop: Loop): Promise<void> => {
  const store = await getStore();
  const newDeletedItem: DeletedItem<Loop> = {
    item: loop,
    deletedAt: new Date().toISOString(),
  };
  store.loops.unshift(newDeletedItem); // Add to the beginning of the list
  await saveStore(store);
};

export const addPostToRecentlyDeleted = async (post: Post): Promise<void> => {
  const store = await getStore();
  const newDeletedItem: DeletedItem<Post> = {
    item: post,
    deletedAt: new Date().toISOString(),
  };
  store.posts.unshift(newDeletedItem);
  await saveStore(store);
}; 