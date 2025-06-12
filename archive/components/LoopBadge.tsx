import { View } from 'react-native';
import React from 'react';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '../app/_layout';

interface LoopBadgeProps {
  color?: string;
  size?: number;
}

const LoopBadge: React.FC<LoopBadgeProps> = ({ color, size = 10 }) => {
  const theme = useTheme() as ExtendedTheme;
  
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color || theme.colors.accent,
        borderRadius: size / 2,
        marginRight: 4,
      }}
    />
  );
};

export default LoopBadge; 