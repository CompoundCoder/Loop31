import { Post, Loop } from '../types/Loop';

const KEYWORD_MAP: Record<string, string[]> = {
  motivation: ['motivation', 'inspire', 'grind', 'push', 'hustle', 'success', 'goals', 'achieve'],
  quotes: ['quote', 'words', 'wisdom', 'saying', 'thought', 'mindset', 'philosophy'],
  business: ['client', 'deal', 'sale', 'close', 'business', 'startup', 'entrepreneur'],
  fitness: ['gym', 'lift', 'run', 'health', 'workout', 'exercise', 'training', 'fit'],
  lifestyle: ['life', 'balance', 'mindful', 'growth', 'journey', 'progress'],
  social: ['team', 'community', 'network', 'connect', 'relationship', 'partnership'],
  creative: ['design', 'art', 'create', 'innovation', 'original', 'unique', 'style'],
  tech: ['technology', 'digital', 'online', 'software', 'app', 'web', 'platform']
};

export function generateSmartTags(caption: string): string[] {
  const words = caption.toLowerCase().split(/\W+/);
  const tags = new Set<string>();

  // Direct keyword matching
  for (const [tag, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      tags.add(tag);
    }
  }

  // Context-based matching (check for word combinations)
  const captionLower = caption.toLowerCase();
  if (captionLower.includes('step by step') || captionLower.includes('how to')) {
    tags.add('tutorial');
  }
  if (captionLower.includes('did you know') || captionLower.includes('fun fact')) {
    tags.add('facts');
  }
  if (captionLower.match(/\d+\s*(days?|weeks?|months?)/)) {
    tags.add('timeline');
  }

  return Array.from(tags);
}

export function getLoopTags(loop: Loop): string[] {
  const allTags = new Set<string>();
  
  // Combine tags from all posts
  loop.posts.forEach(post => {
    const postTags = generateSmartTags(post.caption);
    postTags.forEach(tag => allTags.add(tag));
  });

  return Array.from(allTags);
}

export function matchesSearchTags(loop: Loop, searchQuery: string): boolean {
  const searchTerms = searchQuery.toLowerCase().split(/\s+/);
  const loopTags = getLoopTags(loop);
  
  // Check if any search term matches any tag
  return searchTerms.some(term => 
    loopTags.some(tag => tag.includes(term))
  );
} 