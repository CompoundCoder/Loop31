import { useState, useCallback } from 'react';
import { useLoops } from '@/context/LoopsContext';
import { useNotifications } from '@/modules/notifications';

interface UseCreateLoopFormProps {
  onSaveSuccess?: (newLoopId: string) => void;
}

export function useCreateLoopForm({ onSaveSuccess }: UseCreateLoopFormProps = {}) {
  const { state: loopsState, dispatch } = useLoops();
  const { addNotification } = useNotifications();

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [color, setColor] = useState('#FF6B6B');

  const resetForm = useCallback(() => {
    setName('');
    setFrequency('weekly');
    setColor('#FF6B6B');
  }, []);

  const validate = useCallback(() => {
    if (!name.trim()) {
      addNotification({
        title: 'Loop Name Required',
        message: 'Please enter a name for your loop.',
        icon: 'alert-circle-outline',
        displayTarget: 'toast',
        accentColor: '#FF6B6B',
      });
      return false;
    }
    if (loopsState.loops.some(loop => loop.title.toLowerCase() === name.trim().toLowerCase())) {
      addNotification({
        title: 'Duplicate Loop Name',
        message: `A loop with the name "${name.trim()}" already exists.`,
        icon: 'alert-circle-outline',
        displayTarget: 'toast',
        accentColor: '#FF6B6B',
      });
      return false;
    }
    return true;
  }, [name, loopsState.loops, addNotification]);

  const handleSave = useCallback(() => {
    if (!validate()) {
      return;
    }
    
    const newLoopId = Date.now().toString(); // Simple ID generation
    dispatch({
      type: 'ADD_LOOP',
      payload: {
        id: newLoopId,
        title: name.trim(),
        schedule: frequency,
        color: color,
        isActive: true,
        posts: [], // Start with an empty post list
        postCount: 0,
      },
    });

    addNotification({
      title: 'Loop Created!',
      message: `Successfully created the "${name.trim()}" loop.`,
      icon: 'check-circle-outline',
      displayTarget: 'toast',
      accentColor: '#06D6A0',
    });

    if (onSaveSuccess) {
      onSaveSuccess(newLoopId);
    }
  }, [name, frequency, color, dispatch, validate, addNotification, onSaveSuccess]);

  return {
    formState: { name, frequency, color },
    formSetters: { setName, setFrequency, setColor },
    handleSave,
    resetForm,
  };
} 