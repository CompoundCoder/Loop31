import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type IconDefinition = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] | React.ComponentProps<typeof Ionicons>['name'];
  library: 'MaterialCommunityIcons' | 'Ionicons';
};

export const legacyIcons: { [key: string]: IconDefinition } = {
  // --- Archived from presets/icons.ts 'actions' group ---
  
  // Reason: Redundant style for edit icon (using MaterialCommunityIcons version now)
  editIonicons: { name: 'pencil-outline', library: 'Ionicons' },
  
  // Reason: Redundant style for delete icon (using MaterialCommunityIcons version now)
  deleteIonicons: { name: 'trash-outline', library: 'Ionicons' },
  
  // Reason: Redundant style for duplicate icon (using MaterialCommunityIcons version now)
  duplicateMaterial: { name: 'content-duplicate', library: 'MaterialCommunityIcons' },
  
  // Reason: No longer in use
  archive: { name: 'archive-outline', library: 'Ionicons' },
  
  // Reason: Redundant style for pin icon (using outline version now)
  pinSolid: { name: 'pin', library: 'MaterialCommunityIcons' },
  
  // Reason: Redundant style for unpin icon (using outline version now)
  unpinSolid: { name: 'pin-off', library: 'MaterialCommunityIcons' },
  
  // Reason: No longer in use
  moveToUpNext: { name: 'arrow-up-circle-outline', library: 'Ionicons' },
  
  // --- Archived from presets/icons.ts 'content' group ---

  // Reason: Redundant style for loop icon
  loopSolid: { name: 'repeat', library: 'MaterialCommunityIcons' },
  
  // Reason: Redundant style for post icon (using plural version now)
  postSingle: { name: 'file-document-outline', library: 'MaterialCommunityIcons' },
  
  // Reason: No longer in use
  image: { name: 'image-outline', library: 'Ionicons' },

  // --- Archived from presets/icons.ts 'menu' group ---

  // Reason: Not part of the core icon set going forward
  options: { name: 'ellipsis-horizontal', library: 'Ionicons' },

  // --- Archived from presets/icons.ts 'platforms' group ---

  // Reason: Platform icons are not considered core UI icons and will be handled separately
  instagram: { name: 'instagram', library: 'MaterialCommunityIcons' },
  facebook: { name: 'facebook', library: 'MaterialCommunityIcons' },
  linkedin: { name: 'linkedin', library: 'MaterialCommunityIcons' },
  twitter: { name: 'twitter', library: 'MaterialCommunityIcons' },
  tiktok: { name: 'music-note', library: 'MaterialCommunityIcons' },

  // --- Archived from other sources during cleanup ---
  
  // Reason: Redundant edit icon style from an older component
  editCreateOutline: { name: 'create-outline', library: 'Ionicons' },
}; 