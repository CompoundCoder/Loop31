import { useMemo, useCallback } from 'react';
import { useNotifications } from '@/modules/notifications';

export const useHomeScreenNotifications = () => {
  const { notifications, dismissNotification } = useNotifications();

  const handleInlineDismiss = useCallback((id: string) => {
    dismissNotification(id);
  }, [dismissNotification]);

  const hasInlinePre = useMemo(() => 
    notifications.some(n => n.displayTarget === 'inlinePre'), 
    [notifications]
  );

  const hasMainFeed = useMemo(() => 
    notifications.some(n => n.displayTarget === 'mainFeed'),
    [notifications]
  );

  return {
    notifications,
    hasInlinePre,
    hasMainFeed,
    handleInlineDismiss,
  };
}; 