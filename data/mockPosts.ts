// data/mockPosts.ts

// Define allowed social platforms
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'pinterest' | 'youtube';

// Define the minimal Post interface
export interface Post {
  id: string; // Unique ID
  imageUrl: string; 
  caption: string;
  platforms: SocialPlatform[];
}

// Export the array of mock posts
export const MOCK_POSTS: Post[] = [
  {
    id: 'mock-post-1',
    imageUrl: 'https://picsum.photos/seed/tech/400/300', // Replaced Unsplash
    caption: 'Just pushed the latest update! Check out the new features. #coding #devlife #update',
    platforms: ['twitter', 'linkedin'],
  },
  {
    id: 'mock-post-2',
    imageUrl: 'https://picsum.photos/seed/science/400/300', // Replaced Unsplash
    caption: 'Exploring the wonders of science today. Fascinating discoveries! #science #research #discovery',
    platforms: ['facebook'],
  },
  {
    id: 'mock-post-3',
    imageUrl: 'https://picsum.photos/seed/nature/400/300', // Replaced Unsplash
    caption: 'Beautiful morning hike! Feeling refreshed and inspired. 🌲 #nature #hiking #outdoors',
    platforms: ['instagram', 'pinterest'],
  },
   {
    id: 'mock-post-4',
    imageUrl: 'https://picsum.photos/seed/food/400/300', // Replaced Unsplash
    caption: 'Trying out a new recipe tonight! Looks delicious. 🥑 #foodie #cooking #healthyfood',
    platforms: ['instagram', 'facebook', 'pinterest'],
  },
   {
    id: 'mock-post-5',
    imageUrl: 'https://picsum.photos/seed/retro/400/300', // Replaced Unsplash
    caption: 'Throwback to classic tech! Simpler times. #retro #technology #tbt',
    platforms: ['tiktok', 'instagram'],
  },
]; 