import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

type InlineDropdownMenuProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  menuWidth?: number;
  anchor?: 'left' | 'right';
};

export default function InlineDropdownMenu({ trigger, children, menuWidth, anchor = 'left' }: InlineDropdownMenuProps) {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isModalRendered, setModalRendered] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ px: 0, py: 0, width: 0 });
  const triggerRef = useRef<View>(null);

  const menuScale = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isMenuVisible) {
      measureTrigger();
      setModalRendered(true);
      menuScale.value = withSpring(1, { damping: 18, stiffness: 250 });
      menuOpacity.value = withTiming(1, { duration: 100 });
      backdropOpacity.value = withTiming(1, { duration: 150 });
    } else {
      if (!isModalRendered) return;
      
      menuScale.value = withTiming(0, { duration: 150 });
      menuOpacity.value = withTiming(0, { duration: 150 });
      backdropOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setModalRendered)(false);
        }
      });
    }
  }, [isMenuVisible]);

  const finalMenuWidth = menuWidth || triggerLayout.width;

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuScale.value }],
    opacity: menuOpacity.value,
    left: anchor === 'right' ? triggerLayout.px + triggerLayout.width - finalMenuWidth : triggerLayout.px,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.1,
  }));

  const measureTrigger = () => {
    triggerRef.current?.measureInWindow((px, py, width, height) => {
      setTriggerLayout({ px, py: py + height, width });
    });
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View>
      <View ref={triggerRef} onLayout={measureTrigger} onTouchEnd={openMenu}>
        {trigger}
      </View>

      <Modal transparent visible={isModalRendered} onRequestClose={closeMenu} animationType="none">
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </Pressable>
        <Animated.View
          style={[
            styles.dropdownMenu,
            { 
              width: finalMenuWidth,
              top: triggerLayout.py,
            },
            menuAnimatedStyle,
          ]}
        >
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { onSelect: closeMenu } as any)
              : child
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  dropdownMenu: {
    position: 'absolute',
    marginTop: 4,
    zIndex: 1000,
    transformOrigin: 'top right',
  },
}); 