import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType, Dimensions } from 'react-native';

interface TestPostCardFeaturedProps {
  imageSource: ImageSourcePropType;
  caption: string;
  onPress: () => void;
}

const cardWidth = Dimensions.get('window').width - 32; // 16px padding on each side of the screen
const imageHeight = (cardWidth / 4) * 3; // 4:3 aspect ratio

const TestPostCardFeatured: React.FC<TestPostCardFeaturedProps> = ({
  imageSource,
  caption,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.captionBox}>
        <Text style={styles.captionText} numberOfLines={2} ellipsizeMode="tail">
          {caption}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    borderRadius: 12,       // Overall card rounded corners
    backgroundColor: '#FFFFFF', // White background for the card itself and shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, // Adjusted for a slightly more subtle Apple-like shadow
    shadowRadius: 8,   // Adjusted for a softer Apple-like shadow
    elevation: 4,      // Adjusted for Android shadow
    marginBottom: 16,  // Space below the card
  },
  image: {
    width: '100%',
    height: imageHeight,
    borderTopLeftRadius: 12,  // Rounded corners only at the top of the image
    borderTopRightRadius: 12,
    // No bottom radius, as the captionBox is below
  },
  captionBox: {
    backgroundColor: '#FFFFFF', // Redundant if container is white, but good for clarity
    paddingVertical: 10,      // Vertical padding inside the caption box
    paddingHorizontal: 12,    // Horizontal padding inside the caption box
    // No marginHorizontal here, the box is full width of the card by default.
    // If inset is desired, add marginHorizontal here and adjust container if needed.
    // For now, assuming caption box is full width within the card's rounded bottom corners.
    // The container's borderRadius will handle the bottom corners of the caption area.
  },
  captionText: {
    fontSize: 15,
    fontWeight: '500', // Slightly less bold than before, common for captions
    color: '#1c1c1e', // Dark gray for text, common Apple color
    lineHeight: 20,    // For 2 lines of text
  },
  // Removed styles for overlay, userInfoContainer, avatar, userName, loopInfoContainer, loopName
});

export default TestPostCardFeatured; 