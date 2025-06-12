import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  ViewStyle,
  Modal,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export type DropdownMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: 'post' | 'loop') => void;
  style?: ViewStyle;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ visible, onClose, onSelect, style }) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.container, style]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.menu,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.md,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              ...(Platform.OS === 'android' ? { elevation: 6 } : {}),
              paddingVertical: spacing.xs,
              minWidth: 170,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.option,
              {
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.md,
                backgroundColor: pressed ? colors.background : 'transparent',
              },
            ]}
            onPress={() => { onSelect('post'); onClose(); }}
            accessibilityLabel="Create new post"
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Create Post</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.option,
              {
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.md,
                backgroundColor: pressed ? colors.background : 'transparent',
              },
            ]}
            onPress={() => { onSelect('loop'); onClose(); }}
            accessibilityLabel="Create new loop"
          >
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>New Loop</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  menu: {
    position: 'absolute',
    top: 44,
    right: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default DropdownMenu; 