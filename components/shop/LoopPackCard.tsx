import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Pressable, Image } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define props for the redesigned LoopPackCard (Carousel version)
interface CarouselLoopPack {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string; // Optional price, shown if locked?
}

interface LoopPackCardProps {
  pack: CarouselLoopPack;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LoopPackCard: React.FC<LoopPackCardProps> = React.memo(({ pack, onPress, style }) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();

  const placeholderImage = 'https://via.placeholder.com/160/CCCCCC/FFFFFF?text=Pack'; // Adjusted placeholder size
  const imageUrl = pack.previewImageUrl || placeholderImage;

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.cardContainer, // Apply flex direction here
        { 
          backgroundColor: colors.card, 
          borderRadius: borderRadius.lg,
          ...elevation,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          opacity: pressed ? 0.85 : 1,
        },
        style, // Height will be passed via this prop from LoopsScreen
      ]}
    >
      {/* Image Section - Fixed Height */}
      <Image 
        source={{ uri: imageUrl }}
        style={styles.image} // Height defined in styles
        resizeMode="cover" 
      />

      {/* Caption Section - Should fill remaining space */}
      <View style={[styles.captionContainer, { padding: spacing.sm }]}>
        <Text 
          style={[styles.title, { color: colors.text }]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {pack.title}
        </Text>
        <View style={styles.premiumLabelContainer}>
          <MaterialCommunityIcons name="crown-outline" size={12} color={colors.primary} />
          <Text style={[styles.premiumLabelText, { color: colors.primary, marginLeft: spacing.xs }]}>
            Premium
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    overflow: 'hidden',
    flexDirection: 'column', // Stack image and caption vertically
  },
  image: {
    width: '100%',
    // aspectRatio: 1, // Removed aspect ratio
    height: 160, // Set fixed height (matching width from LoopsScreen usage)
  },
  captionContainer: {
    // Padding applied inline
    // flex: 1, // Add flex: 1 if needed to ensure it fills space in fixed-height card
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4, 
  },
  premiumLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto', // Push premium label towards the bottom of caption area
  },
  premiumLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
