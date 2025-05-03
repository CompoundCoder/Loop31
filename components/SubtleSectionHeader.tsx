import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface SubtleSectionHeaderProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  // Optional action props can be added later:
  // actionLabel?: string;
  // onActionPress?: () => void;
}

const SubtleSectionHeaderComponent: React.FC<SubtleSectionHeaderProps> = ({ title, style }) => {
  const { colors, spacing } = useThemeStyles();

  return (
    <View style={[styles.container, style]}>
      <Text 
        style={[
          styles.title,
          {
            color: colors.text + 'AA', // Use secondary text color (alpha)
          }
        ]}
      >
        {title}
      </Text>
      {/* Placeholder for optional action button */}
      {/* {actionLabel && onActionPress && (
        <Pressable onPress={onActionPress}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )} */}
    </View>
  );
};

// Wrap the component with React.memo for performance optimization
export const SubtleSectionHeader = React.memo(SubtleSectionHeaderComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between', // To accommodate optional action button later
    alignItems: 'center',
    // Padding/Margin will be handled by the parent container (e.g., headerStyle in LoopsScreen)
  },
  title: {
    fontSize: 15, // Slightly smaller than default section headers
    fontWeight: '500', // Medium weight
  },
  // actionText: { // Styles for optional action
  //   fontSize: 15,
  //   fontWeight: '500',
  //   color: colors.primary, // Example action color
  // }
}); 