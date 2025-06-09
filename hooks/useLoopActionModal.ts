import { useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { Modalize } from 'react-native-modalize';

// Type for the data of the loop currently selected for modal actions
export interface SelectedLoopData {
  id: string;
  title: string;
  isPinned: boolean;
}

// Defines the types of actions that can be performed on a loop via the modal
export type LoopAction = 'edit' | 'duplicate' | 'delete';

// Props for the useLoopActionModal hook, including callbacks for specific loop actions
interface UseLoopActionModalProps {
  onEdit: (loopId: string) => void;
  onDuplicate: (loopId: string) => void;
  onDelete: (loopId: string) => void;
}

/**
 * Custom hook to manage the state and actions for a loop action modal.
 *
 * @param onEdit - Callback function to handle editing a loop.
 * @param onDuplicate - Callback function to handle duplicating a loop.
 * @param onDelete - Callback function to handle deleting a loop.
 * @returns An object containing:
 *  - `modalRef`: Ref to be attached to the Modalize component.
 *  - `selectedLoopData`: State for the currently selected loop's data.
 *  - `handleLongPressLoop`: Function to call when a loop item is long-pressed.
 *  - `handleModalAction`: Function to call when an action is selected within the modal.
 *  - `handleModalCloseConfirmed`: Function to pass to Modalize's `onClosed` prop to process actions and clean up.
 */
export const useLoopActionModal = ({
  onEdit,
  onDuplicate,
  onDelete,
}: UseLoopActionModalProps) => {
  const modalRef = useRef<Modalize>(null);
  const [selectedLoopData, setSelectedLoopData] = useState<SelectedLoopData | null>(null);
  
  // Stores the action and loopId that should be processed after the modal closes
  const [pendingActionInfo, setPendingActionInfo] = useState<{ action: LoopAction; loopId: string } | null>(null);

  /**
   * Handles the long press event on a loop item.
   * Sets the selected loop data, triggers haptic feedback, and opens the modal.
   */
  const handleLongPressLoop = useCallback((loopId: string, loopTitle: string, isPinned: boolean) => {
    setSelectedLoopData({ id: loopId, title: loopTitle, isPinned });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    modalRef.current?.open();
  }, []); // Dependencies: setSelectedLoopData, Haptics, modalRef are stable

  /**
   * Handles an action selected from within the modal (e.g., Edit, Duplicate, Delete).
   * It stores the action to be performed and the relevant loopId, then closes the modal.
   * The actual execution of the action is deferred to `handleModalCloseConfirmed`.
   */
  const handleModalAction = useCallback((action: LoopAction) => {
    if (!selectedLoopData) {
      console.warn('handleModalAction called without selectedLoopData.');
      return;
    }
    setPendingActionInfo({ action, loopId: selectedLoopData.id });
    modalRef.current?.close();
  }, [selectedLoopData]); // Dependency: selectedLoopData

  /**
   * This function should be connected to the `onClosed` prop of the Modalize component.
   * It executes any pending action (edit, duplicate, delete) after the modal has finished closing.
   * It also clears the selected loop data and the pending action info.
   */
  const handleModalCloseConfirmed = useCallback(() => {
    if (pendingActionInfo) {
      const { action, loopId } = pendingActionInfo;
      switch (action) {
        case 'edit':
          onEdit(loopId);
          break;
        case 'duplicate':
          onDuplicate(loopId);
          break;
        case 'delete':
          onDelete(loopId); // onDelete callback itself might show an Alert for confirmation
          break;
      }
    }
    // Always clear state after the modal is closed, regardless of whether an action was performed
    setSelectedLoopData(null);
    setPendingActionInfo(null);
  }, [pendingActionInfo, onEdit, onDuplicate, onDelete]); // Dependencies: pendingActionInfo and action callbacks

  return {
    modalRef,
    selectedLoopData,
    handleLongPressLoop,
    handleModalAction,
    handleModalCloseConfirmed,
  };
}; 