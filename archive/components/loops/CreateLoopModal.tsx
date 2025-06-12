import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoopEditMenu from './LoopEditMenu';
import { useLoops, type Loop } from '@/context/LoopsContext';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { v4 as uuidv4 } from 'uuid';
import type { Theme as AppTheme } from '@/theme/theme';
import type { LoopFormData } from './LoopFormFields'; // Import LoopFormData type
import type { ThemeStyles } from '@/hooks/useThemeStyles'; // Correct import for ThemeStyles type
import { useLoopModal } from '@/context/LoopModalContext'; // Added import

interface CreateLoopModalProps {
  isVisible: boolean;
  onClose: () => void;
  typography: AppTheme['typography'];
}

const CreateLoopModal: React.FC<CreateLoopModalProps> = ({ isVisible, onClose, typography }) => {
  const modalizeRef = useRef<Modalize>(null);
  const { dispatch } = useLoops();
  const themeStyles = useThemeStyles();
  const insets = useSafeAreaInsets();
  const { setCreateLoopModalVisible } = useLoopModal(); // Get the context function

  const [formData, setFormData] = useState<LoopFormData | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  useEffect(() => {
    if (isVisible) {
      modalizeRef.current?.open();
      // Reset form data when modal becomes visible and is for creation
      setFormData(null); 
      setIsSaveDisabled(true);
    } else {
      modalizeRef.current?.close();
    }
  }, [isVisible]);

  useEffect(() => {
    // Enable save button only if formData exists and title is not empty
    if (formData && formData.title.trim()) {
      setIsSaveDisabled(false);
    } else {
      setIsSaveDisabled(true);
    }
  }, [formData]);

  const handleDataChange = useCallback((data: LoopFormData) => {
    setFormData(data);
  }, []);

  const handleSaveLoop = useCallback(() => {
    if (formData && !isSaveDisabled) {
      let scheduleToSave = formData.schedule;
      if (formData.schedule === '...' && formData.customDays.length > 0) {
        scheduleToSave = formData.customDays.join(', ');
      } else if (formData.schedule === '...' && formData.customDays.length === 0) {
        scheduleToSave = 'Auto'; // Default if custom is selected but no days are chosen
      }

      const newLoop: Loop = {
        id: uuidv4(),
        title: formData.title.trim() || 'Untitled Loop',
        color: formData.color || themeStyles.colors.primary,
        schedule: scheduleToSave,
        posts: [],
        isActive: true,
        postCount: 0,
      };
      dispatch({ type: 'ADD_LOOP', payload: newLoop });
      onClose(); // Close modal after saving
    } else {
      console.warn("[CreateLoopModal] Save called but form data is invalid or not present.");
    }
  }, [formData, isSaveDisabled, dispatch, onClose, themeStyles.colors.primary]);

  // Pass themeStyles and typography to createStyles
  const styles = createStyles(themeStyles, typography);

  return (
    <Modalize
      ref={modalizeRef}
      adjustToContentHeight
      modalTopOffset={135}
      onClosed={() => {
        onClose(); // Call original onClose
        setCreateLoopModalVisible(false); // Update context state
      }}
      modalStyle={{
        backgroundColor: themeStyles.colors.card,
        borderTopLeftRadius: themeStyles.borderRadius.lg,
        borderTopRightRadius: themeStyles.borderRadius.lg,
      }}
      HeaderComponent={
        <View style={styles.modalHeader}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.modalHeaderText, { color: themeStyles.colors.text }]}>Create New Loop</Text>
          </View>
          <TouchableOpacity onPress={handleSaveLoop} disabled={isSaveDisabled} style={styles.headerSaveButton}>
            <Text style={[
              styles.headerButtonText,
              {
                color: isSaveDisabled ? themeStyles.colors.tabInactive : themeStyles.colors.accent,
                fontWeight: typography.fontWeight.bold,
              }
            ]}>Save</Text>
          </TouchableOpacity>
        </View>
      }
      scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
      childrenStyle={{ paddingBottom: 16 }} // 👈 Add this here to reduce excess space at bottom
    >
      <LoopEditMenu
        loop={null} // Always for creation in this modal
        onDataChange={handleDataChange} // Pass the callback to receive form data updates
        onClose={onClose} // Keep onClose for potential internal use in LoopEditMenu if ever needed
        typography={typography}
      />
    </Modalize>
  );
};

// Update createStyles to accept themeStyles and typography as parameters
const createStyles = (themeStyles: ThemeStyles, typography: AppTheme['typography']) => StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: themeStyles.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: themeStyles.colors.border,
  },
  headerTitleContainer: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  modalHeaderText: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  headerSaveButton: {
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: typography.fontSize.body,
  }
});

export default CreateLoopModal; 