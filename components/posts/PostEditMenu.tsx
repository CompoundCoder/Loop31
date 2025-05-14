import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import useUndo from 'use-undo';
import debounce from 'lodash.debounce'; // Import debounce
import { LinearGradient } from 'expo-linear-gradient'; // Added import

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
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1.91);
  const [hasRemixed, setHasRemixed] = useState(false);
  const isDismissingRef = useRef(false);

  // --- useUndo State ---
  const [
    editableCaptionState,
    {
      set: setEditableCaption,
      undo: handleUndo,
      redo: handleRedo,
      reset: resetCaption,
      canUndo,
      canRedo,
    },
  ] = useUndo(post?.caption || '');

  // --- Add liveCaption state and debounced commit ---
  const [liveCaption, setLiveCaption] = useState(post?.caption || '');

  const debouncedCommitUndo = useMemo(
    () => debounce((text: string) => setEditableCaption(text), 1200),
    [setEditableCaption]
  );
  // --- End liveCaption and debounce setup ---

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

  // const editableCaption = editableCaptionState.present; // No longer needed here, liveCaption is primary for display

  useEffect(() => {
    // Reset all values when post changes
    const initialCaption = post?.caption || '';
    resetCaption(initialCaption); // Reset use-undo state
    setLiveCaption(initialCaption); // Reset live caption state
    setHasRemixed(false);
    isMorphing.value = false;

    buttonOpacity.value = 0;
    buttonTranslateY.value = 20;
    buttonScale.value = 1;
    remixButtonTextWidth.value = 0;
    buttonWidth.value = 160;
    buttonBorderRadius.value = INITIAL_BUTTON_BORDER_RADIUS;
    animatedPaddingHorizontal.value = 0;
    textOpacity.value = 1;
    iconOpacity.value = 0;
    buttonColorProgress.value = 0;

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
  }, [post, resetCaption]); // resetCaption is stable from useUndo, so mainly [post]

  useEffect(() => {
    if (debounceTimerRef.current) { // This is for the remix button visibility debounce
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!isVisible) {
      // Reset all values when modal closes
      buttonOpacity.value = 0;
      buttonTranslateY.value = 20;
      buttonScale.value = 1;
      remixButtonTextWidth.value = 0;
      buttonWidth.value = 160;
      buttonBorderRadius.value = INITIAL_BUTTON_BORDER_RADIUS;
      animatedPaddingHorizontal.value = 0;
      textOpacity.value = 1;
      iconOpacity.value = 0;
      buttonColorProgress.value = 0;
      setHasRemixed(false);
      isMorphing.value = false;
      
      const initialModalCloseCaption = post?.caption || '';
      resetCaption(initialModalCloseCaption); // Reset use-undo state
      setLiveCaption(initialModalCloseCaption); // Reset live caption state
      return;
    }

    const captionLength = liveCaption.trim().length; // Use liveCaption for button visibility

    // Debounce logic for showing/hiding the initial button state (Remix Button)
    if (captionLength > 10) {
      const timeoutId = setTimeout(() => {
        if (!hasRemixed) {
          buttonOpacity.value = withTiming(1, { duration: ANIMATION_DURATION, easing: EASING });
          buttonTranslateY.value = withTiming(0, { duration: ANIMATION_DURATION, easing: EASING });
          textOpacity.value = withTiming(1, { duration: FADE_DURATION });
        }
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
      debounceTimerRef.current = timeoutId;
    } else {
      if (!hasRemixed) {
        buttonOpacity.value = withTiming(0, { duration: ANIMATION_DURATION / 2, easing: EASING });
        buttonTranslateY.value = withTiming(20, { duration: ANIMATION_DURATION / 2, easing: EASING });
        textOpacity.value = withTiming(0, { duration: FADE_DURATION / 2 });
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [
    liveCaption, // NOW depends on liveCaption
    isVisible,
    buttonOpacity,
    buttonTranslateY,
    hasRemixed,
    textOpacity,
    // Removed other shared values not directly driving this effect
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

  // Effect to update liveCaption when use-undo state changes (e.g. after undo/redo)
  useEffect(() => {
    setLiveCaption(editableCaptionState.present);
  }, [editableCaptionState.present]);

  // Cleanup effect for debouncedCommitUndo
  useEffect(() => {
    return () => {
      debouncedCommitUndo.cancel();
    };
  }, [debouncedCommitUndo]); // Added debouncedCommitUndo to dependency array as it's an external variable

  const handleCaptionInputChange = (text: string) => {
    setLiveCaption(text);
    if (post) onCaptionChange(post.id, text); // Propagate live changes to parent

    const lastChar = text.slice(-1);
    const commitNow = lastChar === ' ' || /[.,!?]/.test(lastChar);

    if (commitNow) {
      debouncedCommitUndo.cancel();
      setEditableCaption(text); // Commit to use-undo history
    } else {
      debouncedCommitUndo(text); // Debounce commit to use-undo history
    }
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

      {/* Shadow Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.85)']}
        locations={[0.05, 0.85]} // Top 5% transparent, fades to dark over next 80%, bottom 15% fully dark
        style={styles.shadowGradientOverlay}
        pointerEvents="none" // Make sure it doesn't block interactions
      />

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
            <View style={styles.undoRedoContainer}>
              <TouchableOpacity
                onPress={handleUndo}
                style={styles.undoRedoButton}
                disabled={!canUndo}
              >
                <Ionicons // Use Ionicons for both platforms
                  name="arrow-undo-outline"
                  size={18}
                  color={!canUndo ? colors.text + '60' : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRedo}
                style={styles.undoRedoButton}
                disabled={!canRedo}
              >
                <Ionicons // Use Ionicons for both platforms
                  name="arrow-redo-outline"
                  size={18}
                  color={!canRedo ? colors.text + '60' : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input below the header */}
          <View>
            <TextInput
              style={styles.captionInput}
              value={liveCaption} // Use liveCaption for TextInput value
              onChangeText={handleCaptionInputChange}
              placeholder="Enter caption..."
              placeholderTextColor={themeStyles.colors.text + '99'}
              multiline={true}
              scrollEnabled={false}
              textAlignVertical="top"
            />
          </View>

          {/* New Wrapper for the Remix Button */}
          <View style={styles.remixButtonWrapper}>
            <Animated.View
              style={[
                styles.remixButtonAnimatedContainer, // Base styles
                animatedButtonStyle, // Dynamic animated styles
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
    shadowGradientOverlay: { // Added style for the gradient
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
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
      justifyContent: 'space-between', // Added to position label and undo/redo
      marginBottom: spacing.sm, 
      width: '100%', 
      paddingHorizontal: spacing.md, 
    },
    undoRedoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    undoRedoButton: {
      backgroundColor: '#f0f0f0', // Light gray background
      borderRadius: 20, // Circular
      padding: 6, // Padding around icon
    },
    remixButtonAnimatedContainer: {
      height: BUTTON_HEIGHT, // Use new constant for height
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 255, 0.2)', // Light blue debug color for the button itself
      // alignSelf: 'center', // Removed - wrapper will handle alignment
      // marginTop: spacing.md, // Removed - wrapper will handle top margin
    },
    remixButtonWrapper: { // New style for the wrapper
      width: '100%',
      alignItems: 'flex-end', // Pushes child (button) to the right
      //backgroundColor: 'rgba(0, 255, 0, 0.2)', // Light green debug color for the wrapper
      paddingHorizontal: spacing.md, // Padding for the wrapper content
      marginTop: spacing.sm, // Space above the wrapper
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