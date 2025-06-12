import React from 'react';
import { useLoops, type Loop } from '@/context/LoopsContext';
import LoopPopupBase, { type LoopFormData } from './LoopPopupBase';

interface EditLoopPopupProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  loop: Loop | null;
}

const EditLoopPopup: React.FC<EditLoopPopupProps> = ({ visible, onClose, onSaveSuccess, loop }) => {
  const { dispatch } = useLoops();

  const handleUpdateLoop = (data: LoopFormData) => {
    if (!loop) return;

    const updatedLoopPayload: Loop = {
      ...loop,
      ...data,
    };
    dispatch({ type: 'UPDATE_LOOP', payload: updatedLoopPayload });
    onSaveSuccess();
  };

  return (
    <LoopPopupBase
      visible={visible}
      onClose={onClose}
      onSave={handleUpdateLoop}
      title="Edit Loop"
      saveButtonText="Save Changes"
      initialValues={loop ?? undefined}
    />
  );
};

export default EditLoopPopup; 