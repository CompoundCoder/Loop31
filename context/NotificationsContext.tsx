import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  scheduleNotifs: boolean;
  failureNotifs: boolean;
  engagementNotifs: boolean;
  weeklyDigest: boolean;
}

interface NotificationsContextType {
  settings: NotificationSettings;
  updateSetting: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
  togglePushNotifications: (enabled: boolean) => Promise<void>;
  toggleEmailNotifications: (enabled: boolean) => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  scheduleNotifs: true,
  failureNotifs: true,
  engagementNotifs: false,
  weeklyDigest: true,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    
    // If disabling main toggles, disable all related notifications
    if (key === 'pushEnabled' && !value) {
      newSettings.scheduleNotifs = false;
      newSettings.failureNotifs = false;
      newSettings.engagementNotifs = false;
    } else if (key === 'emailEnabled' && !value) {
      newSettings.weeklyDigest = false;
    }

    // If enabling a specific notification, ensure the main toggle is on
    if (key !== 'pushEnabled' && (key === 'scheduleNotifs' || key === 'failureNotifs' || key === 'engagementNotifs') && value) {
      newSettings.pushEnabled = true;
    } else if (key === 'weeklyDigest' && value) {
      newSettings.emailEnabled = true;
    }

    await saveSettings(newSettings);

    // Here you would typically make API calls to update notification preferences on the server
    // For now, we'll just simulate it with a console log
    console.log('Updated notification settings:', newSettings);
  };

  const togglePushNotifications = async (enabled: boolean) => {
    await updateSetting('pushEnabled', enabled);
  };

  const toggleEmailNotifications = async (enabled: boolean) => {
    await updateSetting('emailEnabled', enabled);
  };

  return (
    <NotificationsContext.Provider value={{
      settings,
      updateSetting,
      togglePushNotifications,
      toggleEmailNotifications,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
} 