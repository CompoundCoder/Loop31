import { Ionicons } from '@expo/vector-icons';

export const getPlatformIconName = (type: string): keyof typeof Ionicons.glyphMap => {
  // Handle null/undefined input
  if (!type) return 'globe-outline';

  // Convert to lowercase for case-insensitive matching
  const platform = type.toLowerCase();

  // Facebook matches
  if (platform.includes('fb') || platform.includes('facebook')) {
    return 'logo-facebook';
  }

  // Instagram matches
  if (platform.includes('ig') || platform.includes('instagram')) {
    return 'logo-instagram';
  }

  // Twitter matches
  if (platform.includes('tw') || platform.includes('twitter')) {
    return 'logo-twitter';
  }

  // LinkedIn matches
  if (platform.includes('li') || platform.includes('linkedin')) {
    return 'logo-linkedin';
  }

  // TikTok matches
  if (platform.includes('tt') || platform.includes('tiktok')) {
    return 'logo-tiktok';
  }

  // Default fallback
  return 'globe-outline';
}; 