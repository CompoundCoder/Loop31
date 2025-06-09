import { useCallback } from 'react';

// Simplified type for navigation function
export type NavigateFunction = (screen: string, params?: { [key: string]: any }) => void;

// Updated SetSelectedLoopCallback to match the typical three-argument signature
export type SetSelectedLoopCallback = (loopId: string, loopTitle: string, isPinned: boolean) => void;

// Using a more generic dispatch type to avoid specific action mismatches with context
// For better type safety, this could be the exact LoopsAction from context if no circular deps.
export type LoopDispatch = (action: any) => void;

interface UseLoopActionsProps {
  navigation: NavigateFunction;
  dispatch: LoopDispatch;
  setSelectedLoop?: SetSelectedLoopCallback;
}

export const useLoopActions = ({
  navigation,
  dispatch,
  setSelectedLoop,
}: UseLoopActionsProps) => {

  const handleLoopPress = useCallback((loopId: string | undefined) => {
    if (!loopId) return;
    navigation('[loopId]', { loopId });
  }, [navigation]);

  const handleLongPressLoop = useCallback((loopId: string, loopTitle: string, isPinned: boolean) => {
    if (setSelectedLoop) {
      // Calling with three arguments to match the updated SetSelectedLoopCallback type
      setSelectedLoop(loopId, loopTitle, isPinned);
    }
  }, [setSelectedLoop]);

  const handleToggleLoopActive = useCallback((loopId: string, newIsActive: boolean) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive: newIsActive } });
  }, [dispatch]);

  const handlePinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'PIN_LOOP', payload: loopId });
  }, [dispatch]);

  const handleUnpinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'UNPIN_LOOP', payload: loopId });
  }, [dispatch]);

  return {
    handleLoopPress,
    handleLongPressLoop,
    handleToggleLoopActive,
    handlePinLoop,
    handleUnpinLoop,
  };
}; 