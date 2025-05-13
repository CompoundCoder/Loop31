import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-native-modal';
import { View, StyleSheet, Text, ScrollView, Image, TextInput, TouchableOpacity, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

// Basic Post type, assuming it would be shared or imported from a common types file
interface Post {
  id: string;
  caption: string;
  previewImageUrl?: string;
}

export interface PostEditMenuProps {
  isVisible: boolean;
  onClose: () => void;
  post: Post | null;
  onCaptionChange: (postId: string, newCaption: string) => void;
}

// Animation configuration
const ANIMATION_DURATION = 300;
const EASING = Easing.out(Easing.ease);
const DEBOUNCE_DELAY = 1200; // 1.2 seconds
const FADE_DURATION = 250; // Faster duration for fade in/out
const FADE_EASING = Easing.out(Easing.exp); // Easing for fade out
const FADE_IN_EASING = Easing.in(Easing.ease); // Easing for fade in

const REMIX_BUTTON_TEXT = "Remix with AI"; // Export button text to a constant

// Spring configuration for the morph bounce
const springConfig = {
  damping: 20,
  stiffness: 150,
  mass: 1,
};

// Updated Button Dimensions
const BUTTON_HEIGHT = 36;
const INITIAL_BUTTON_BORDER_RADIUS = 18;
const FINAL_BUTTON_WIDTH = 36;
const FINAL_BUTTON_BORDER_RADIUS = 18;

export const PostEditMenu: React.FC<PostEditMenuProps> = ({
  isVisible,
  onClose,
  post,
  onCaptionChange,
}) => {
  const insets = useSafeAreaInsets();
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles);
  const [editableCaption, setEditableCaption] = useState(post?.caption || '');
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1.91);
  const [hasRemixed, setHasRemixed] = useState(false);
  const isDismissingRef = useRef(false); // Added for dismiss logic

  const { colors, spacing } = themeStyles;
  const { width: screenWidth } = Dimensions.get('window');
  const containerPadding = spacing.lg;
  // initialButtonWidth is no longer needed, width is content-driven initially

  // --- Reanimated Setup ---
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);
  const buttonScale = useSharedValue(1);
  const remixButtonTextWidth = useSharedValue(0); // To store measured text width
  const buttonWidth = useSharedValue<number>(160); // Initial width set to 160 (fallback)
  const buttonBorderRadius = useSharedValue(INITIAL_BUTTON_BORDER_RADIUS); // Use new initial radius
  const animatedPaddingHorizontal = useSharedValue<number>(0); // Changed from spacing.md to 0
  const textOpacity = useSharedValue(1); // Opacity for "Remix with AI" text
  const iconOpacity = useSharedValue(0); // Opacity for the emoji icon
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMorphing = useSharedValue(false); // Ensure this definition is present
  const buttonColorProgress = useSharedValue(0); // Shared value for color animation

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      width: buttonWidth.value, // Fallback -> dynamic text width + padding -> final fixed width
      paddingHorizontal: animatedPaddingHorizontal.value, // Animated padding
      borderRadius: buttonBorderRadius.value, // Use shared value for radius
      backgroundColor: interpolateColor(
        buttonColorProgress.value, 
        [0, 1], 
        ['#f2f2f7', colors.accent] // Use #f2f2f7 as default, colors.accent as target
      ),
      transform: [
        { translateY: buttonTranslateY.value },
        { scale: buttonScale.value }
      ],
    };
  });

  // Animated style for the text content
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  // Animated style for the icon content
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      opacity: iconOpacity.value,
    };
  });

  // --- End Reanimated Setup ---

  useEffect(() => {
    // Reset all values when post changes
    setEditableCaption(post?.caption || '');
    setHasRemixed(false);
    isMorphing.value = false; // Reset morphing flag here

    buttonOpacity.value = 0;
    buttonTranslateY.value = 20;
    buttonScale.value = 1;
    remixButtonTextWidth.value = 0; // Reset measured text width
    buttonWidth.value = 160; // Reset to 160
    buttonBorderRadius.value = INITIAL_BUTTON_BORDER_RADIUS; // Reset radius
    animatedPaddingHorizontal.value = 0; // Changed from spacing.md to 0
    textOpacity.value = 1; // Reset text opacity
    iconOpacity.value = 0; // Reset icon opacity
    buttonColorProgress.value = 0; // Reset color progress

    if (post?.previewImageUrl) {
      Image.getSize(
        post.previewImageUrl,
        (width, height) => {
          if (height > 0) setImageAspectRatio(width / height);
          else setImageAspectRatio(1.91);
        },
        (error) => {
          console.error(`Failed to get image size for ${post.previewImageUrl}:`, error);
          setImageAspectRatio(1.91);
        }
      );
    } else {
      setImageAspectRatio(1.91);
    }
  }, [post]); // Removed initialButtonWidth from dependencies

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!isVisible) {
      // Reset all values when modal closes
      buttonOpacity.value = 0;
      buttonTranslateY.value = 20;
      buttonScale.value = 1;
      remixButtonTextWidth.value = 0; // Reset measured text width
      buttonWidth.value = 160; // Reset to 160
      buttonBorderRadius.value = INITIAL_BUTTON_BORDER_RADIUS; // Reset radius
      animatedPaddingHorizontal.value = 0; // Changed from spacing.md to 0
      textOpacity.value = 1; // Reset text opacity
      iconOpacity.value = 0; // Reset icon opacity
      buttonColorProgress.value = 0; // Reset color progress
      setHasRemixed(false);
      isMorphing.value = false; // Reset morphing flag here
      return;
    }

    const captionLength = editableCaption.trim().length;

    // Debounce logic for showing/hiding the initial button state
    if (captionLength > 10) {
      const timeoutId = setTimeout(() => {
        if (!hasRemixed) { // Only animate if not already remixed
          buttonOpacity.value = withTiming(1, { duration: ANIMATION_DURATION, easing: EASING });
          buttonTranslateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: EASING });
          // Ensure text is visible if button appears
          textOpacity.value = withTiming(1, { duration: FADE_DURATION });
          // Width and Radius are NOT animated here, they remain initial
        }
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
      debounceTimerRef.current = timeoutId;
    } else {
      if (!hasRemixed) { // Only animate if not already remixed
        buttonOpacity.value = withTiming(0, { duration: ANIMATION_DURATION / 2, easing: EASING });
        buttonTranslateY.value = withTiming(20, { duration: ANIMATION_DURATION / 2, easing: EASING });
        // Fade out text if button hides
        textOpacity.value = withTiming(0, { duration: FADE_DURATION / 2 });
        // Width and Radius are NOT animated here
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    editableCaption,
    isVisible,
    buttonOpacity,
    buttonTranslateY,
    hasRemixed,
    textOpacity,
    iconOpacity,
    buttonWidth,        // Keep buttonWidth
    animatedPaddingHorizontal, // Use new animated padding SV
    buttonBorderRadius,
  ]);

  // Reaction to update buttonWidth based on measured text width
  useAnimatedReaction(
    () => ({
      textWidthValue: remixButtonTextWidth.value, // Listen to text width
      morphingState: isMorphing.value,       // Listen to morphing state
    }),
    (currentState, previousState) => {
      'worklet';
      const { textWidthValue, morphingState } = currentState;

      if (morphingState === false && textWidthValue > 0) {
        // Only update if not morphing and text has been measured
        const newCalculatedWidth = textWidthValue + 2 * spacing.md;
        // Optional: Check if significantly different to avoid rapid small updates, though direct set is fine.
        if (Math.abs(buttonWidth.value - newCalculatedWidth) > 1) { // Check if different enough
            buttonWidth.value = newCalculatedWidth;
        }
      }
      // If morphingState is true, or textWidthValue is 0, do nothing to buttonWidth here.
      // buttonWidth maintains its current value (either initial 160, or what animations set during morph).
    },
    [spacing.md] // Dependencies for the reaction (theme spacing)
  );

  const handleCaptionInputChange = (text: string) => {
    setEditableCaption(text);
    if (post) onCaptionChange(post.id, text);
  };

  // Custom dismiss handler to prevent double calls
  const handleDismiss = () => {
    if (isDismissingRef.current) {
      return;
    }
    isDismissingRef.current = true;
    onClose();
  };

  const handleModalHide = () => {
    isDismissingRef.current = false; // Reset dismiss flag when modal is hidden
    // Note: Other reset logic for button state etc. is already in useEffect for isVisible
  };

  const handleRemixPress = () => {
    if (post && !hasRemixed) {
      isMorphing.value = true; // Set flag BEFORE animations start

      // 1. Scale Up
      buttonScale.value = withSpring(1.04, {}, (finishedScaleUp) => {
        if (finishedScaleUp) {
          // 2. Fade out text
          textOpacity.value = withTiming(0, { duration: FADE_DURATION, easing: FADE_EASING });

          // Icon fades in during the morph, starting concurrently with morph animations
          iconOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });

          animatedPaddingHorizontal.value = withSpring(0, springConfig);
          buttonBorderRadius.value = withSpring(FINAL_BUTTON_BORDER_RADIUS, springConfig);
          buttonScale.value = withSpring(1, springConfig); // Scale down to normal
          buttonColorProgress.value = withSpring(1, springConfig); // Animate color progress
          
          // Animate buttonWidth and set shared values in its completion callback
          buttonWidth.value = withSpring(FINAL_BUTTON_WIDTH, springConfig, (finishedWidthMorph) => {
            if (finishedWidthMorph) {
              // These are UI thread updates, safe here
              isMorphing.value = false; 
              remixButtonTextWidth.value = 0; 

              // JS thread update for React state
              runOnJS(setHasRemixed)(true);
            }
          });

        } else {
          // Scale up didn't complete, reset isMorphing flag
          isMorphing.value = false; // Reset flag if animation sequence fails early
        }
      });
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      // onBackdropPress={onClose} // Removed, using custom backdrop
      onSwipeComplete={handleDismiss} // Changed to handleDismiss
      swipeDirection="down"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={350} // Added
      animationOutTiming={300} // Added
      useNativeDriver={true} // Added
      hideModalContentWhileAnimating={true} // Added
      backdropOpacity={0} // Changed to 0
      style={styles.modal}
      avoidKeyboard
      propagateSwipe
      onModalHide={handleModalHide} // Added
    >
      {/* Custom Tappable Backdrop Area */}
      <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <View style={[styles.contentView, { paddingBottom: insets.bottom + themeStyles.spacing.md }]}>
        <View style={styles.grabber} />
        <Text style={styles.modalTitle}>Edit Post</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {post?.previewImageUrl ? (
            <Image
              source={{ uri: post.previewImageUrl }}
              style={[styles.imagePreview, { aspectRatio: imageAspectRatio }]}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderImageText}>No Image</Text>
            </View>
          )}

          {/* Header with Label and Button */}
          <View style={styles.captionHeaderContainer}>
            <Text style={styles.captionLabel}>Edit Caption</Text>

            {/* Button Animated Container: Now a direct child of captionHeaderContainer */}
            <Animated.View
              style={[
                styles.remixButtonAnimatedContainer,
                animatedButtonStyle,
              ]}
            >
              <TouchableOpacity
                style={styles.remixButtonTouchable}
                onPress={handleRemixPress}
                activeOpacity={0.8}
                disabled={hasRemixed}
              >
                <Animated.Text 
                  style={[styles.remixButtonText, animatedTextStyle]}
                  numberOfLines={1} // Prevent wrapping
                  ellipsizeMode="clip" // Clip if somehow still overflows (safety)
                  onLayout={(event) => {
                    const measuredWidth = event.nativeEvent.layout.width;
                    if (measuredWidth > 0) {
                      remixButtonTextWidth.value = measuredWidth;
                    }
                  }}
                >
                  {REMIX_BUTTON_TEXT}
                </Animated.Text>
                <Animated.View style={[styles.remixButtonIconContainer, animatedIconStyle]}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Input below the header */}
          <View> 
            <TextInput
              style={styles.captionInput}
              value={editableCaption}
              onChangeText={handleCaptionInputChange}
              placeholder="Enter caption..."
              placeholderTextColor={themeStyles.colors.text + '99'}
              multiline={true}
              scrollEnabled={false}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
        <Text style={styles.footerText}>All changes are saved automatically</Text>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ThemeStyles) => {
  const { colors, spacing, borderRadius } = theme;

  const modalElevation = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  };

  return StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    contentView: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      ...modalElevation,
    },
    grabber: {
      width: 48,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    imagePreview: {
      width: '100%',
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.border,
    },
    imagePlaceholder: {
      width: '100%',
      aspectRatio: 1.91,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeholderImageText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    captionInput: {
      // Style for the TextInput itself
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      minHeight: 100, 
      borderWidth: 1,
      borderColor: colors.border,
      textAlignVertical: 'top',
      //marginTop: spacing.sm, // Add some space below the header row
    },
    captionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text + 'A0',
    },
    captionHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      //marginBottom: spacing.sm, // Add space below header before input
      alignItems: 'flex-end',
      paddingBottom: spacing.sm,
      width: '100%', // Ensure full-width
      justifyContent: 'space-between', // Add this to push items apart
      paddingHorizontal: spacing.sm, // Keep padding for the row
      //backgroundColor: 'rgba(255, 0, 0, 0.1)', // Temporary debug color
    },
    remixButtonAnimatedContainer: {
      height: BUTTON_HEIGHT, // Use new constant for height
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 255, 0.1)', // Temporary debug color
      //marginBottom: spacing.sm,
    },
    remixButtonTouchable: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    remixButtonText: {
      color: colors.primary,
      fontSize: 14, // Reduced font size for smaller button
      fontWeight: '600',
      letterSpacing: 0.3,
      position: 'absolute',
      textAlign: 'center',
    },
    remixButtonIconContainer: {
      position: 'absolute',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    footerText: {
      fontSize: 13,
      color: colors.text + '99',
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
};

// No default export, using named export 'PostEditMenu' as requested. 