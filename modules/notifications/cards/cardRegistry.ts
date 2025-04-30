import ReminderCard, { ReminderCardProps } from './ReminderCard';
import type { BaseCardProps } from './BaseCardProps';
import React from 'react';

// Extend this type as you add more card types
export type CardType = 'reminder';

// Map card types to their React components and props
export const cardRegistry: Record<CardType, React.ComponentType<any>> = {
  reminder: ReminderCard,
};

// Optionally, a type-safe factory for card props
export type CardPropsMap = {
  reminder: ReminderCardProps;
  // alert: AlertCardProps;
  // tip: TipCardProps;
}; 