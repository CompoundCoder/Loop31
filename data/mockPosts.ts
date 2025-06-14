// data/mockPosts.ts

// Define allowed social platforms
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'pinterest' | 'youtube';

// Define the minimal Post interface
export interface Post {
  id: string; // Unique ID
  imageUrl: string; 
  caption: string;
  platforms: SocialPlatform[];
  loopFolders?: string[]; // Optional array of loop folder IDs
}

// Export the array of mock posts with correct loopFolders
export const MOCK_POSTS: Post[] = [
  {
    id: 'mock-post-1',
    imageUrl: 'https://picsum.photos/seed/tech/400/300',
    caption: 'Just pushed the latest update! Check out the new features.',
    platforms: ['twitter', 'linkedin'],
    loopFolders: ['p1', 'p2'], // Belongs to Core Content and Community Engagement
  },
  {
    id: 'mock-post-2',
    imageUrl: 'https://picsum.photos/seed/science/400/300',
    caption: 'Exploring the wonders of science today.',
    platforms: ['facebook'],
    loopFolders: ['p1'], // Belongs to Core Content
  },
  {
    id: 'mock-post-3',
    imageUrl: 'https://picsum.photos/seed/nature/400/300',
    caption: 'Beautiful morning hike!',
    platforms: ['instagram', 'pinterest'],
    loopFolders: ['f3', 'auto-listing'], // Belongs to Testimonials and Auto-Listing
  },
   {
    id: 'mock-post-4',
    imageUrl: 'https://picsum.photos/seed/food/400/300',
    caption: 'Trying out a new recipe tonight!',
    platforms: ['instagram', 'facebook', 'pinterest'],
    loopFolders: ['p2'], // Belongs to Community Engagement
  },
   {
    id: 'mock-post-5',
    imageUrl: 'https://picsum.photos/seed/retro/400/300',
    caption: 'Throwback to classic tech!',
    platforms: ['tiktok', 'instagram'],
    loopFolders: ['f2'], // Belongs to Market Updates
  },
]; 