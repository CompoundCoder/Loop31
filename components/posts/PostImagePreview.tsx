import React from 'react';
import { View, Image, StyleSheet, useWindowDimensions, ImageSourcePropType, Platform } from 'react-native';
import { useResponsiveImageHeight } from '@/hooks/useResponsiveImageHeight';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface PostImagePreviewProps {
  source: ImageSourcePropType;
  aspectRatio: number | null;
  borderRadius: number;
}

export const PostImagePreview: React.FC<PostImagePreviewProps> = ({ 
  source, 
  aspectRatio, 
  borderRadius,
}) => {
  const { spacing } = useThemeStyles();
  const { width: windowWidth } = useWindowDimensions();

  // NOTE: This width calculation is duplicated from PostMenus.tsx to satisfy the hook's
  // dependency without altering the parent component's signature, as per instructions.
  const containerWidth = (windowWidth * (Platform.OS === 'web' ? 0.6 : 0.95)) - (spacing.xl * 2);
  
  const { height: responsiveHeight } = useResponsiveImageHeight({ aspectRatio, containerWidth });

  return (
    <View style={[
      styles.container, 
      { 
        borderRadius,
      }
    ]}>
      <Image
        source={source}
        style={{
          width: '100%',
          height: responsiveHeight,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 