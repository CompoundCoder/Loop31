import { useState, useRef, useCallback } from 'react';
import { View } from 'react-native'; // For RefObject type
import * as Haptics from 'expo-haptics';

// The router object from Expo's useRouter hook typically has a push method.
// We can define a minimal type for what this hook needs.
interface ExpoRouter {
  push: (href: any, options?: any) => void;
  // Add other methods if the hook uses them, e.g., replace, back
}

interface UseLoopsHeaderProps {
  router: ExpoRouter; 
  onOpenNewLoopForm: () => void;
}

export const useLoopsHeader = ({
  router,
  onOpenNewLoopForm,
}: UseLoopsHeaderProps) => {
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const addButtonRef = useRef<View>(null);

  const openCreatePopover = useCallback(() => {
    setIsPopoverVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const closeCreatePopover = useCallback(() => {
    setIsPopoverVisible(false);
  }, []);

  const handlePopoverAction = useCallback((action: 'loop') => {
    closeCreatePopover(); 
    if (action === 'loop') {
      onOpenNewLoopForm(); 
    }
  }, [onOpenNewLoopForm, closeCreatePopover]);

  return {
    addButtonRef,
    isPopoverVisible,
    openCreatePopover,
    closeCreatePopover, 
    handlePopoverAction,
  };
}; 