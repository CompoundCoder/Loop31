import { useCallback } from 'react';
import { useNotifications } from '@/modules/notifications';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export const useLoopNotifications = () => {
  const { addNotification } = useNotifications();
  const { colors } = useThemeStyles();

  const notifyDuplicate = useCallback((title: string) => {
    addNotification({
      title: 'Loop Duplicated',
      message: `Your loop "${title}" has been duplicated.`,
      icon: 'content-copy',
      accentColor: colors.accent,
      displayTarget: 'toast',
    });
  }, [addNotification, colors.accent]);

  const notifyDelete = useCallback((title: string) => {
    addNotification({
      title: 'Loop Deleted',
      message: `Your loop "${title}" has been deleted.`,
      icon: 'trash-can-outline',
      accentColor: colors.warning,
      displayTarget: 'toast',
    });
  }, [addNotification, colors.warning]);

  const notifyPin = useCallback((title: string) => {
    addNotification({
      title: 'Loop Pinned',
      message: `"${title}" is now pinned.`,
      icon: 'pin',
      accentColor: colors.accent, // Or perhaps a different color for distinction, e.g. colors.primary
      displayTarget: 'toast',
    });
  }, [addNotification, colors.accent]);

  const notifyUnpin = useCallback((title: string) => {
    addNotification({
      title: 'Loop Unpinned',
      message: `"${title}" is no longer pinned.`,
      icon: 'pin-off',
      accentColor: colors.border, // Or a neutral color like colors.textMuted
      displayTarget: 'toast',
    });
  }, [addNotification, colors.border]);

  return {
    notifyDuplicate,
    notifyDelete,
    notifyPin,
    notifyUnpin,
  };
};

export default useLoopNotifications; 