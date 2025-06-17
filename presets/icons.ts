import { lightTheme } from '@/theme/theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { colors } = lightTheme;

interface IconPreset {
  size: number;
  color: string;
}

/**
 * ========================================================================
 * A. Icon Size & Color Presets
 *
 * Reusable presets for common icon styles throughout the app.
 * ========================================================================
 */

/**
 * A small icon, typically used for inline metadata.
 * Color is slightly muted.
 */
export const iconSmall: IconPreset = {
  size: 14,
  color: colors.text + 'A6', // ~65% opacity
};

/**
 * A medium-sized icon, for general purpose use where the icon has more prominence.
 */
export const iconMedium: IconPreset = {
  size: 20,
  color: colors.text,
};

/**
 * Default styling for platform icons (e.g., social media logos).
 */
export const platformIconDefault: IconPreset = {
  size: 18,
  color: colors.text,
};

/**
 * A specific preset for icons within muted metadata rows.
 * This provides a consistent, secondary appearance.
 */
export const metadataIconMuted: IconPreset = {
  size: 14,
  color: colors.text + '99', // ~60% opacity
};

// === Icon Standard Registry ===
// delete        → trash-can-outline (MaterialCommunityIcons)
// edit          → pencil-outline (MaterialCommunityIcons)
// pin / unpin   → pin-outline / pin-off-outline (MaterialCommunityIcons)
// moveToUpNext  → arrow-up-circle-outline (Ionicons)
// duplicate     → content-copy (MaterialCommunityIcons)
// save          → checkmark (Ionicons)

type IconDefinition = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] | React.ComponentProps<typeof Ionicons>['name'];
  library: 'MaterialCommunityIcons' | 'Ionicons';
};

export const appIcons: { [group: string]: { [key: string]: IconDefinition } } = {
  // Common navigation and toolbar icons
  navigation: {
    back: { name: 'chevron-back', library: 'Ionicons' },
    close: { name: 'close', library: 'Ionicons' },
    add: { name: 'add', library: 'Ionicons' },
    save: { name: 'checkmark', library: 'Ionicons' },
  },
  
  // Core actions for menus and buttons
  actions: {
    edit: { name: 'pencil-outline', library: 'MaterialCommunityIcons' },
    delete: { name: 'trash-can-outline', library: 'MaterialCommunityIcons' },
    duplicate: { name: 'content-copy', library: 'MaterialCommunityIcons' },
    pin: { name: 'pin', library: 'MaterialCommunityIcons' },
    unpin: { name: 'pin-off-outline', library: 'MaterialCommunityIcons' },
    moveToUpNext: { name: 'arrow-up-circle-outline', library: 'Ionicons' },
  },

  // Icons representing content types
  content: {
    loop: { name: 'repeat-outline', library: 'Ionicons' },
    post: { name: 'file-multiple-outline', library: 'MaterialCommunityIcons' },
  },

  // Icons for status indicators
  status: {
    active: { name: 'play-circle-outline', library: 'MaterialCommunityIcons' },
    paused: { name: 'pause-circle-outline', library: 'MaterialCommunityIcons' },
    error: { name: 'alert-circle-outline', library: 'MaterialCommunityIcons' },
    success: { name: 'check-circle-outline', library: 'MaterialCommunityIcons' },
    schedule: { name: 'calendar', library: 'Ionicons' },
  },

  // Platform-specific logos
  platforms: {
    instagram: { name: 'instagram', library: 'MaterialCommunityIcons' },
    facebook: { name: 'facebook', library: 'MaterialCommunityIcons' },
    linkedin: { name: 'linkedin', library: 'MaterialCommunityIcons' },
    twitter: { name: 'twitter', library: 'MaterialCommunityIcons' },
    tiktok: { name: 'music-note', library: 'MaterialCommunityIcons' },
  },
}; 