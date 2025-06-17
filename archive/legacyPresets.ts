// This file contains legacy style objects that have been replaced by the
// centralized preset system in the presets/ directory. It is kept for
// historical reference and can be removed in the future.

import { Easing } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

// from utils/dragAnimationPresets.ts
// replaced by presets from presets/animations.ts
export const DRAG_ANIMATION_CONFIG = {
  dragActivation: {
    stiffness: 220,
    damping: 18,
  },
  dragRelease: {
    stiffness: 180,
    damping: 20,
  },
};

// from SlideUpMenu/animations.ts
// replaced by presets from presets/animations.ts
export const slideUpTimingConfig = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// from SlideUpMenu/animations.ts
// replaced by presets from presets/animations.ts
export const slideUpSpringConfig = {
  damping: 15,
  stiffness: 120,
  mass: 0.9,
};

// from components/loops/LoopPopupBase.tsx
// replaced by presets from presets/modals.ts
export const legacyModalStyles = {
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFF', // Example, would use theme in preset
    padding: 24,
    borderRadius: 16,
    zIndex: 2,
    marginHorizontal: 24,
  },
};

// from components/loops/LoopFormFields.tsx
// replaced by presets from presets/forms.ts
export const legacyFormStyles = {
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
};

// from components/loops/LoopEditMenu.tsx
// replaced by presets from presets/forms.ts
export const legacyEditMenuStyles = {
  section: {
    marginBottom: 24,
  },
  errorText: {
    color: 'red', // Example, would use theme in preset
    fontSize: 12,
    marginTop: 4,
  },
}; 