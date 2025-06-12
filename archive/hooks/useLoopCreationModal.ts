import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icon types

// --- Type Definitions ---
export type LoopFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

// Minimal Loop interface for defining NewLoopData, avoiding external context dependencies
interface MinimalLoopForCreation {
  id: string; // Will be generated, but part of the full Loop structure
  title: string;
  color: string;
  schedule: string; // e.g., "Daily", "Weekly"
  isActive: boolean;
  frequency: LoopFrequency;
  // Fields that will be defaulted by the caller of onAddLoop or have defaults
  postCount?: number;
  posts?: any[]; 
  status?: string; 
  randomize?: boolean;
  linkedAccounts?: any[];
}

// Data structure for a new loop, passed to the onAddLoop callback
// Requires core fields, others are optional or defaulted by the consumer of onAddLoop
export type NewLoopData = Pick<MinimalLoopForCreation, 'title' | 'color' | 'schedule' | 'isActive' | 'frequency'>;

// More specific display target options to match consumer expectations
export type NotificationDisplayTarget = 'inline' | 'mainFeed' | 'toast' | 'inlinePre';

// Input for the addNotification callback
export type NotificationInput = {
  title: string;
  message: string;
  accentColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // Use specific icon keys and make it required
  displayTarget: NotificationDisplayTarget; // Changed to required and specific type
};

// Callback types for props
export type AddLoopCallback = (newLoopDetails: NewLoopData) => string; // Returns new loop ID
export type AddNotificationCallback = (notification: NotificationInput) => void;

// Props for the hook
export interface UseLoopCreationModalProps {
  onAddLoop: AddLoopCallback;
  addNotification: AddNotificationCallback;
  initialLoopColor: string;
}

// Return shape of the hook
export interface UseLoopCreationModalReturn {
  isCreateModalVisible: boolean;
  formState: {
    loopName: string;
    loopColor: string;
    frequency: LoopFrequency;
  };
  handlers: {
    handleOpenCreateModal: () => void;
    handleCloseCreateModal: () => void;
    handleSaveNewLoop: () => boolean; // Returns true on success, false on failure
    setLoopName: React.Dispatch<React.SetStateAction<string>>;
    setLoopColor: React.Dispatch<React.SetStateAction<string>>;
    setFrequency: React.Dispatch<React.SetStateAction<LoopFrequency>>;
  };
}

export const useLoopCreationModal = ({
  onAddLoop,
  addNotification,
  initialLoopColor,
}: UseLoopCreationModalProps): UseLoopCreationModalReturn => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loopName, setLoopName] = useState('');
  const [frequency, setFrequency] = useState<LoopFrequency>('daily');
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

  const handleSaveNewLoop = useCallback((): boolean => {
    if (!loopName.trim()) {
      // Simple feedback; consumer can implement more robust validation UI
      // For now, matching the requirement of not referencing components for alerts.
      // Consider returning a more specific error or status in a real-world scenario.
      console.warn("Loop Name Required: Please enter a name for your loop.");
      return false;
    }

    const scheduleDisplay = frequency.charAt(0).toUpperCase() + frequency.slice(1);

    const newLoopDetails: NewLoopData = {
      title: loopName.trim(),
      color: loopColor,
      schedule: scheduleDisplay,
      isActive: false, // Default for a new loop
      frequency: frequency,
    };

    // The onAddLoop callback is responsible for generating the ID and fully constructing the loop
    const newLoopId = onAddLoop(newLoopDetails);

    if (newLoopId) {
      addNotification({
        title: 'Loop Created!',
        message: `"${loopName.trim()}" has been added to your loops.`,
        accentColor: loopColor,
        icon: 'check-circle', // This is a MaterialCommunityIcons key
        displayTarget: 'toast',
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsCreateModalVisible(false);
      return true;
    }
    return false;
  }, [loopName, frequency, loopColor, onAddLoop, addNotification]); // Removed initialLoopColor as it's used in open, not save

  return {
    isCreateModalVisible,
    formState: {
      loopName,
      loopColor,
      frequency,
    },
    handlers: {
      handleOpenCreateModal,
      handleCloseCreateModal,
      handleSaveNewLoop,
      setLoopName,
      setLoopColor,
      setFrequency,
    },
  };
}; 