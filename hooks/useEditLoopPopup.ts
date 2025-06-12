import { useState, useCallback } from 'react';
import type { Loop } from '@/context/LoopsContext';

/**
 * A hook to manage the state of the Edit Loop Popup.
 *
 * @returns An object with state and methods to control the popup.
 * - `isEditPopupVisible`: A boolean indicating if the popup should be visible.
 * - `loopToEdit`: The loop object currently being edited.
 * - `openEditPopup`: A function to open the popup with a specific loop.
 * - `closeEditPopup`: A function to close the popup and clear the state.
 */
export const useEditLoopPopup = () => {
  const [loopToEdit, setLoopToEdit] = useState<Loop | null>(null);

  const openEditPopup = useCallback((loop: Loop) => {
    setLoopToEdit(loop);
  }, []);

  const closeEditPopup = useCallback(() => {
    setLoopToEdit(null);
  }, []);

  return {
    isEditPopupVisible: !!loopToEdit,
    loopToEdit,
    openEditPopup,
    closeEditPopup,
  };
}; 