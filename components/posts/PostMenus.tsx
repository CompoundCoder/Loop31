import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  Image,
  Alert,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PostDisplayData } from '@/app/(loops)/[loopId]';
import { usePostMenuLogic } from '@/hooks/usePostMenuLogic';
import { PostImagePreview } from './PostImagePreview';

export interface PostFormData {
  imageSource: ImageSourcePropType | null;
  caption: string;
}

interface PostMenusProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: PostFormData) => void;
  post?: PostDisplayData | null;
}

const PostMenuContent: React.FC<Omit<PostMenusProps, 'isVisible'>> = ({
  onClose,
  onSave,
  post,
}) => {
  const theme = useThemeStyles();
  const { colors, spacing, typography, borderRadius } = theme;
  const insets = useSafeAreaInsets();

  const {
    mode,
    caption,
    setCaption,
    imageSource,
    imageAspectRatio,
    animatedRemixButtonStyle,
    handlePickImage,
  } = usePostMenuLogic(post);

  const handleSave = () => {
    if (!imageSource && caption.trim() === '') {
      Alert.alert('Empty Post', 'Please add an image or a caption before saving.');
      return;
    }
    onSave({
      imageSource: imageSource,
      caption: caption.trim(),
    });
  };

  const canSave = imageSource !== null || caption.trim() !== '';

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const maxImageHeight = windowHeight * 0.45;
  const contentPadding = spacing.xl * 2;
  const pickerWidth = (windowWidth * 0.95) - contentPadding;

  const imagePickerStyle = [
    styles.imagePicker,
    {
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      marginTop: spacing.lg,
    },
    imageSource ? { height: undefined } : { height: pickerWidth * (5 / 7) },
  ];

  const imagePreviewStyle = [
    styles.imagePreview,
    imageAspectRatio
      ? { aspectRatio: imageAspectRatio }
      : { height: pickerWidth * (5 / 7) },
  ];

  return (
    <View style={[styles.modalContent, { 
      backgroundColor: colors.card, 
      borderRadius: borderRadius.lg,
      marginTop: insets.top > 0 ? insets.top + spacing.sm : spacing.lg,
    }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSize.title, fontWeight: '500' }]}>
          {mode === 'edit' ? 'Edit Post' : 'New Post'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <TouchableOpacity onPress={handlePickImage} style={imagePickerStyle}>
          {imageSource ? (
            <PostImagePreview 
              source={imageSource}
              aspectRatio={imageAspectRatio}
              borderRadius={borderRadius.md}
            />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.tabInactive} />
              <Text style={{ color: colors.tabInactive, marginTop: spacing.sm }}>
                {mode === 'edit' ? 'Add an Image' : 'Select an Image'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg }}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundDefault,
                borderColor: colors.border,
                color: colors.text,
                fontSize: typography.fontSize.body,
                paddingHorizontal: spacing.lg,
                paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm + 4,
                borderRadius: borderRadius.md,
                height: 100,
                textAlignVertical: 'top',
              },
            ]}
            value={caption}
            onChangeText={setCaption}
            placeholder="What should this post say?"
            placeholderTextColor={colors.tabInactive}
            multiline
          />
          <Animated.View style={[styles.remixButtonContainer, animatedRemixButtonStyle]}>
            <TouchableOpacity
              style={[
                styles.remixButton,
                { backgroundColor: colors.accent, borderRadius: borderRadius.full },
              ]}>
              <Text
                style={[
                  styles.remixButtonText,
                  { color: 'white', fontSize: typography.fontSize.caption, fontWeight: 'bold' },
                ]}>
                Remix with AI
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, padding: spacing.lg, flexDirection: 'row' }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.footerButtonBase,
            { backgroundColor: colors.background, marginRight: spacing.md, flex: 1, borderRadius: borderRadius.md },
          ]}>
          <Text style={{ color: colors.text, fontWeight: '500', fontSize: typography.fontSize.body }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={[
            styles.footerButtonBase,
            { backgroundColor: canSave ? colors.accent : colors.border, flex: 1, borderRadius: borderRadius.md },
          ]}>
          <Text
            style={{
              color: canSave ? 'white' : colors.tabInactive,
              fontWeight: 'bold',
              fontSize: typography.fontSize.body,
            }}>
            {mode === 'edit' ? 'Update Post' : 'Save Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PostMenus: React.FC<PostMenusProps> = ({ isVisible, onClose, onSave, post }) => {
  const animationProgress = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      animationProgress.value = withTiming(1, { duration: 300 });
    } else {
      animationProgress.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
    }
  }, [isVisible, animationProgress]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [{ translateY: interpolate(animationProgress.value, [0, 1], [40, 0]) }],
    };
  });

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={[styles.fullScreenContainer, animatedContainerStyle]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
          <PostMenuContent onClose={onClose} onSave={onSave} post={post} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  flexContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    width: Platform.OS === 'web' ? '60%' : '95%',
    maxWidth: 500,
  },
  modalContent: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {},
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: undefined,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
  },
  remixButtonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  remixButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  remixButtonText: {},
  footer: {
    borderTopWidth: 1,
  },
  footerButtonBase: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PostMenus; 