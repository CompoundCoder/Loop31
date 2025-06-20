import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cardShadow } from '@/theme/shadows';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const CARD_MEDIA_ASPECT_RATIO = 7 / 5;

interface TestPostCardMiniProps {
  image: ImageSourcePropType; // Accept number for require() or {uri: string} for network
  caption: string;
  onPress?: () => void; // Added onPress prop
  onLongPress?: () => void; // Add long press handler
  drag?: () => void; // Prop to initiate drag
  isActive?: boolean; // Prop to indicate active drag state
}

// const cardHeight = 100; // Removed fixed height
// const imageSize = cardHeight - 2 * 12; // Removed fixed image size calculation

const TestPostCardMini: React.FC<TestPostCardMiniProps> = ({ image, caption, onPress, onLongPress, drag, isActive }) => {
  const { colors } = useThemeStyles();
  return (
    <TouchableOpacity 
      onPress={onPress} 
      onLongPress={onLongPress}
      style={[styles.cardContainer, { backgroundColor: colors.card }, cardShadow]}
      activeOpacity={isActive ? 1 : 0.8} // Adjust activeOpacity based on isActive, or keep consistent if preferred
      disabled={isActive} // Disable touchable when active to prevent onPress firing during drag
    >
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.spacer} />
        <View style={styles.captionWrapper}>
          <Text style={[styles.captionText, { color: colors.text }]} numberOfLines={3} ellipsizeMode="tail">
            {caption}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6, 
    marginTop: 6,
  },
  spacer: {
    flex: 0.5,
    //backgroundColor: 'rgb(255, 0, 0)', // TEMP: light red
  },
  imageContainer: {
    width: '40%', 
    aspectRatio: CARD_MEDIA_ASPECT_RATIO, 
    marginRight: 12, 
    //backgroundColor: 'rgb(255, 0, 0)', // TEMP: light red
  },
  image: {
    width: '100%', 
    height: '100%', 
    borderRadius: 8, 
  },
  rightColumn: {
    flex: 1,
    flexDirection: 'column',
    //backgroundColor: 'rgb(0, 13, 255)', // TEMP: blue
  },
  captionWrapper: {
    //backgroundColor: 'rgb(255, 0, 255)', // TEMP: magenta
    paddingRight: 8,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 22, 
    textAlign: 'left', 
  },
  optionsButton: {
    paddingLeft: 8, 
    paddingVertical: 4, 
  }
  // captionContainer: { ... }, // Removed if unused
  // captionRow: { ... }, // Removed if unused
});

export default TestPostCardMini; 

// Summary: Refined vertical alignment using spacerTop and spacerBottom blocks around the captionWrapper. Caption is now truly vertically centered. Menu icon remains pinned bottom right. All blocks have debug colors for verification. 