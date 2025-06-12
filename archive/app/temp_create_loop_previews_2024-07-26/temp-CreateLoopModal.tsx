import React from 'react';
import CreateLoopModal from '@/components/modals/CreateLoopModal';
import ScreenContainer from '@/components/ScreenContainer';

// This is a temporary screen to preview the CreateLoopModal component.
export default function CreateLoopModalPreviewScreen() {
  return (
    <ScreenContainer>
      <CreateLoopModal onClose={() => {}} />
    </ScreenContainer>
  );
} 