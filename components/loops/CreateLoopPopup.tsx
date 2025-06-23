import React from 'react';
import { useLoops, type Loop } from '@/context/LoopsContext';
import LoopPopupBase, { type LoopFormData } from './LoopPopupBase';

interface CreateLoopPopupProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const CreateLoopPopup: React.FC<CreateLoopPopupProps> = ({ visible, onClose, onSaveSuccess }) => {
  const { dispatch } = useLoops();

  const handleCreateLoop = (data: LoopFormData) => {
    const newLoopPayload: Loop = {
      ...data,
      id: `loop-${Date.now()}`,
      postCount: 0,
      status: 'draft',
      isActive: true,
      isPinned: false,
      previewImageUrl: '',
    };
    dispatch({ type: 'ADD_LOOP', payload: newLoopPayload });
    onSaveSuccess();
  };

  return (
    <LoopPopupBase
      visible={visible}
      onClose={onClose}
      onSave={handleCreateLoop}
      title="Create Loop"
      saveButtonText="Done"
    />
  );
};

export default CreateLoopPopup; 