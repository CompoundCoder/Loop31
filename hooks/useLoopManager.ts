import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLoops } from '@/context/LoopsContext';
import type { Loop, LoopsAction } from '@/context/LoopsContext';
import type { NotificationInput } from '@/modules/notifications';

interface UseLoopManagerProps {
  addNotification: (notification: NotificationInput) => void;
  themeColors: {
    accent: string;
    border: string;
    warning: string; // Added for delete notifications
    // Add other colors if needed by notifications (e.g., success for edit/duplicate)
  };
}

export interface UseLoopManagerResult {
  loopList: Loop[];
  loopMap: Map<string, Loop>; // Using Map as it's more appropriate than Record for .get()
  pinLoop: (id: string) => void;
  unpinLoop: (id: string) => void;
  editLoop: (id: string, updates: Partial<Loop>) => void;
  duplicateLoop: (id: string) => void;
  deleteLoop: (id: string) => void;
}

export const useLoopManager = ({
  addNotification,
  themeColors,
}: UseLoopManagerProps): UseLoopManagerResult => {
  const { state, dispatch } = useLoops();

  const loopList = state.loops;

  const loopMap = useMemo(() => {
    const map = new Map<string, Loop>();
    if (state.loops) {
      for (const loop of state.loops) {
        map.set(loop.id, loop);
      }
    }
    return map;
  }, [state.loops]);

  const pinLoop = useCallback((id: string) => {
    dispatch({ type: 'PIN', payload: id });
    addNotification({ 
      title: 'Loop Pinned', 
      message: '', 
      accentColor: themeColors.accent, 
      icon: 'pin',
      displayTarget: 'toast' 
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [dispatch, addNotification, themeColors.accent]);

  const unpinLoop = useCallback((id: string) => {
    dispatch({ type: 'UNPIN', payload: id });
    addNotification({ 
      title: 'Loop Unpinned', 
      message: '', 
      accentColor: themeColors.border, 
      icon: 'pin-off',
      displayTarget: 'toast' 
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [dispatch, addNotification, themeColors.border]);

  const editLoop = useCallback((id: string, updates: Partial<Loop>) => {
    // Assuming 'UPDATE_LOOP' is an action type in LoopsContext
    // The payload structure might need to match your context's reducer exactly
    dispatch({ type: 'UPDATE_LOOP', payload: { id, ...updates } });
    addNotification({
      title: 'Loop Updated',
      message: `Changes to "${updates.title || loopMap.get(id)?.title || 'Loop'}" have been saved.`,
      accentColor: themeColors.accent, // Or a success color if available
      icon: 'pencil-circle', // Or 'check-circle'
      displayTarget: 'toast',
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [dispatch, addNotification, themeColors.accent, loopMap]);

  const duplicateLoop = useCallback((id: string) => {
    const originalLoop = loopMap.get(id);
    if (originalLoop) {
      const newLoop: Loop = {
        ...originalLoop,
        id: `loop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More robust unique ID
        title: `${originalLoop.title} (Copy)`,
        // Reset any instance-specific fields if necessary, e.g., isActive, postCount for a fresh duplicate
        isActive: false, 
        postCount: 0,
      };
      // Assuming 'DUPLICATE_LOOP' or 'ADD_LOOP' can handle adding this new loop object
      dispatch({ type: 'ADD_LOOP', payload: newLoop }); // Or 'DUPLICATE_LOOP' if that action exists and has specific logic
      addNotification({ 
        title: 'Loop Duplicated', 
        message: `A copy of "${originalLoop.title}" has been created.`, 
        icon: 'content-copy', 
        displayTarget: 'toast',
        accentColor: themeColors.accent // Or a specific color for duplication
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [dispatch, addNotification, themeColors.accent, loopMap]);

  const deleteLoop = useCallback((id: string) => {
    const loopToDelete = loopMap.get(id);
    const loopTitle = loopToDelete?.title || 'this loop';
    Alert.alert(
      `Delete Loop?`,
      `Are you sure you want to delete "${loopTitle}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch({ type: 'DELETE', payload: id });
            addNotification({ 
              title: 'Loop Deleted', 
              message: `"${loopTitle}" has been deleted.`, 
              icon: 'trash-can-outline', 
              displayTarget: 'toast',
              accentColor: themeColors.warning
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      ]
    );
  }, [dispatch, addNotification, themeColors.warning, loopMap]);

  return {
    loopList,
    loopMap,
    pinLoop,
    unpinLoop,
    editLoop,
    duplicateLoop,
    deleteLoop,
  };
}; 