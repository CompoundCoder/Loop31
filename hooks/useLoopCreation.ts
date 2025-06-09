import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { CreateLoopMenuProps } from '@/components/CreateLoopMenu'; 
import type { Loop } from '@/context/LoopsContext';
import type { MaterialCommunityIcons } from '@expo/vector-icons'; // Import for icon types

// Assuming NotificationDisplayTarget might be exported from notification types, or define locally if not.
// For now, defining it based on the error message for clarity.
export type NotificationDisplayTarget = 'inline' | 'mainFeed' | 'toast' | 'inlinePre';

// Define the structure of the data expected by the onAddLoop callback
export type NewLoopData = Omit<Loop, 'postCount' | 'posts' | 'status' | 'linkedAccounts' | 'randomize' | 'id'> & Partial<Pick<Loop, 'postCount' | 'posts' | 'status' | 'linkedAccounts' | 'randomize'>>;

export type AddLoopCallback = (loopData: NewLoopData) => string; // Returns new loop ID

export type AddNotificationFunction = (notification: { 
  title: string; 
  message: string; 
  accentColor: string; // Changed from optional to required
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // Corrected: icon is required if the base type in useNotifications requires it.
  displayTarget: NotificationDisplayTarget; // Changed to required
}) => void;

interface UseLoopCreationProps {
  onAddLoop: AddLoopCallback;
  addNotification: AddNotificationFunction;
  initialLoopColor: string; // This will serve as a fallback for accentColor
}

export const useLoopCreation = ({ 
  onAddLoop, 
  addNotification, 
  initialLoopColor 
}: UseLoopCreationProps) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loopName, setLoopName] = useState('');
  const [frequency, setFrequency] = useState<CreateLoopMenuProps['frequency']>('daily');
  const [loopColor, setLoopColor] = useState(initialLoopColor);

  const handleOpenCreateModal = useCallback(() => {
    setLoopName(''); 
    setFrequency('daily');
    setLoopColor(initialLoopColor);
    setIsCreateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initialLoopColor]);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalVisible(false);
  }, []);

  const handleSaveNewLoop = useCallback(() => {
    if (!loopName.trim()) {
      // Alerting from the hook is generally not ideal for separation of concerns.
      // Returning false allows the consuming component to handle UI feedback (e.g., showing an Alert).
      // For now, keeping a simple browser alert to indicate failure if no UI handling is present yet.
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert("Loop Name Required\nPlease enter a name for your loop.");
      }
      return false;
    }
    
    const schedule = frequency.charAt(0).toUpperCase() + frequency.slice(1);

    const newLoopDetails: NewLoopData = {
      title: loopName,
      color: loopColor,
      schedule: schedule,
      isActive: false, 
      frequency: frequency,
    };

    const newLoopId = onAddLoop(newLoopDetails);

    if (newLoopId) {
        addNotification({
        title: 'Loop Created!',
        message: `"${loopName}" has been added to your loops.`,
        accentColor: loopColor || initialLoopColor, // Ensure a string is passed
        icon: 'check-circle', // Assuming 'check-circle' is a valid key
        displayTarget: 'toast' // This is a valid NotificationDisplayTarget
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsCreateModalVisible(false);
        return true;
    }
    return false;
  }, [loopName, frequency, loopColor, onAddLoop, addNotification, initialLoopColor]);

  return {
    isCreateModalVisible,
    loopName,
    setLoopName,
    frequency,
    setFrequency,
    loopColor,
    setLoopColor,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleSaveNewLoop,
  };
}; 