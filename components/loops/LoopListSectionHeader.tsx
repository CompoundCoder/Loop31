import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { SubtleSectionHeader } from '@/components/SubtleSectionHeader';
import { useThemeStyles } from '@/hooks/useThemeStyles'; // For default spacing

interface LoopListSectionHeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  // Optionally, pass spacing if not using useThemeStyles directly here
  // For simplicity, using useThemeStyles for default margin if no style is passed
}

const LoopListSectionHeader: React.FC<LoopListSectionHeaderProps> = ({ title, style }) => {
  const { spacing } = useThemeStyles();
  const defaultStyle = { marginBottom: spacing.sm }; // Default style from original renderItem

  return (
    <View style={[defaultStyle, style]}>
      <SubtleSectionHeader title={title} />
    </View>
  );
};

export default LoopListSectionHeader; 