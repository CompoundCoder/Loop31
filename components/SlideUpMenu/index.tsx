import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import Animated, { useSharedValue, runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import MenuHeader from './header'; // Corrected import statement
// import { useSlideUpAnimation, callOnJS } from './animations'; // DEBUG: Temporarily comment out
import type { SlideUpMenuProps, SlideUpMenuRef } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_MAX_HEIGHT_PERCENTAGE = 0.85; // Max 85% of screen height

const SlideUpMenu = React.forwardRef<SlideUpMenuRef, SlideUpMenuProps>((
  { 
    children,
    title = '', // Provide a default value for title
    isVisible: parentIsVisible, // Renamed from isVisible to avoid conflict with internal state
    onClose,
    onSave,
    onOpenRequest, // Added
    showSaveButton = true 
  },
  ref
) => {
  // TEMPORARY DEBUG LOG
  console.log('SlideUpMenu mounted, parentIsVisible:', parentIsVisible);

  const theme = useTheme();
  const themeStyles = useThemeStyles();
  const styles = React.useMemo(() => createStyles(themeStyles, theme), [themeStyles, theme]);

  // Internal state to manage actual visibility, controlled by parent via props
  const [isVisible, setIsVisible] = useState(parentIsVisible);
  const [menuActualHeight, setMenuActualHeight] = useState(SCREEN_HEIGHT * MENU_MAX_HEIGHT_PERCENTAGE);
  const translateY = useSharedValue(menuActualHeight); // Start off-screen

  // Sync internal visibility with parent prop
  useEffect(() => {
    // TEMPORARY DEBUG LOG
    console.log('SlideUpMenu useEffect for parentIsVisible:', parentIsVisible, 'Internal isVisible:', isVisible);
    if (parentIsVisible) {
      openMenu();
    } else {
      closeMenu(false); // Don't call onClose again if already closing
    }
  }, [parentIsVisible]);

  // const { animatedMenuSheetStyle, animatedBackdropStyle } = useSlideUpAnimation(
  //   isVisible, // Use internal isVisible for animation hook
  //   menuActualHeight,
  //   translateY
  // ); // DEBUG: Temporarily comment out

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    const maxHeight = SCREEN_HEIGHT * MENU_MAX_HEIGHT_PERCENTAGE;
    const newHeight = Math.min(height, maxHeight);
    if (newHeight !== menuActualHeight) {
      setMenuActualHeight(newHeight);
      // If menu is not visible, ensure translateY is set to the new height (off-screen)
      if (!isVisible) {
        translateY.value = newHeight;
      }
    }
  };

  const safeOnClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const openMenu = useCallback(() => {
    // TEMPORARY DEBUG LOG
    console.log('SlideUpMenu openMenu called');
    setIsVisible(true);
  }, []);

  const closeMenu = useCallback((callParentOnClose = true) => {
    // TEMPORARY DEBUG LOG
    console.log('SlideUpMenu closeMenu called, callParentOnClose:', callParentOnClose);
    setIsVisible(false);
    // translateY animation is handled by useSlideUpAnimation useEffect
    if (callParentOnClose) {
      // Use a timeout to allow animation to complete before calling onClose
      // This ensures the parent state updates after the menu is visually gone
      setTimeout(() => {
        safeOnClose();
      }, 250); // Corresponds to closeTimingConfig.duration + a small buffer
    }
  }, [safeOnClose]);
  

  React.useImperativeHandle(ref, () => ({
    open: () => {
      if (onOpenRequest) {
        onOpenRequest();
      } else {
        openMenu();
      }
    },
    close: () => closeMenu(true),
  }));

  // const panGesture = Gesture.Pan() // DEBUG: Temporarily comment out gesture handler
  //   .onUpdate((event) => {
  //     if (event.translationY > 0) {
  //       translateY.value = event.translationY;
  //     }
  //   })
  //   .onEnd((event) => {
  //     if (event.translationY > menuActualHeight / 3 || event.velocityY > 500) {
  //       runOnJS(closeMenu)(true);
  //     } else {
  //       translateY.value = withSpring(0, { damping: 50, stiffness: 400 }); 
  //     }
  //   });

  if (!parentIsVisible && !isVisible) { 
    console.log('SlideUpMenu NOT rendering because parentIsVisible is false AND internal isVisible is false');
    return null;
  }

  console.log('SlideUpMenu RENDERING Modal. parentIsVisible:', parentIsVisible, 'Internal isVisible:', isVisible);

  return (
    <Modal
      transparent
      visible={parentIsVisible} 
      animationType="none" 
      onRequestClose={() => closeMenu(true)}
    >
      {/* DEBUG: Static visible content, now the direct child of Modal */}
      {parentIsVisible && (
        <View 
          style={{
            // Ensure it covers a significant area and is visibly distinct
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%', // Take half the screen height
            backgroundColor: 'rgba(0, 0, 255, 0.8)', // Solid blue for high visibility
            zIndex: 10000, // Extremely high zIndex
            justifyContent: 'center',
            alignItems: 'center' 
          }}
        >
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20 }}>
            DEBUG VIEW
          </Text>
          <TouchableOpacity 
            onPress={() => closeMenu(true)} 
            style={{ paddingVertical: 10, paddingHorizontal: 20, marginTop: 20, backgroundColor: 'darkblue'}}
          >
            <Text style={{color: 'white', fontSize: 18}}>Close Debug View</Text>
          </TouchableOpacity>
                </View>
      )}
    </Modal>
  );
});

const createStyles = (themeStyles: ThemeStyles, theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  // Original styles are kept for when we uncomment, but not used by the debug view
  keyboardAvoidingView: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  menuSheet: {
    backgroundColor: themeStyles.colors.card, 
    borderTopLeftRadius: themeStyles.borderRadius.lg, 
    borderTopRightRadius: themeStyles.borderRadius.lg,
    paddingHorizontal: themeStyles.spacing.md,
    paddingTop: themeStyles.spacing.sm, 
    paddingBottom: 0, 
    width: '100%',
    position: 'absolute',
    bottom: 0,
    maxHeight: SCREEN_HEIGHT * MENU_MAX_HEIGHT_PERCENTAGE, 
    ...(themeStyles.elevation && themeStyles.elevation.lg ? themeStyles.elevation.lg : {}),
  },
  safeAreaContainer: {
    backgroundColor: 'transparent', 
    maxHeight: SCREEN_HEIGHT * MENU_MAX_HEIGHT_PERCENTAGE - themeStyles.spacing.sm, 
  },
  contentContainer: {
  },
});

export default SlideUpMenu;
