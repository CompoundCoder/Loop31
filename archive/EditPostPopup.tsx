import React, { useState, useEffect, useRef } from 'react';
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
import { useThemeStyles } from '@/hooks/useThemeStyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLoops } from '@/context/LoopsContext';

export interface PostDisplayData {
  id: string;
  caption: string;
  imageSource: ImageSourcePropType;
}

interface EditPostPopupProps {
  isVisible: boolean;
  post: PostDisplayData;
  loopId: string;
  onClose: () => void;
  onSaveSuccess: (updatedPost: PostDisplayData) => void;
}

interface PostFormData {
  imageSource: ImageSourcePropType | null;
  caption: string;
}

const EditPostPopupContent: React.FC<{
  post: PostDisplayData;
  onClose: () => void;
  onSave: (data: PostFormData) => void;
  loopId: string;
}> = ({ post, onClose, onSave, loopId }) => {
  const theme = useThemeStyles();
  const { colors, spacing, typography, borderRadius } = theme;

  const [caption, setCaption] = useState(post.caption || '');
  const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(post.imageSource);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [showRemixButton, setShowRemixButton] = useState(false);

  useEffect(() => {
    // This effect synchronizes the component's state with the `post` prop.
    // This is crucial for when the modal is reused for different posts.
    setImageSource(post.imageSource);
    setCaption(post.caption || '');
  }, [post.id, post.imageSource, post.caption]);

  const captionInputTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (caption.length > 0) {
      if (captionInputTimer.current) {
        clearTimeout(captionInputTimer.current);
      }
      captionInputTimer.current = setTimeout(() => {
        setShowRemixButton(true);
      }, 1200);
    } else {
      if (captionInputTimer.current) {
        clearTimeout(captionInputTimer.current);
      }
      setShowRemixButton(false);
    }

    return () => {
      if (captionInputTimer.current) {
        clearTimeout(captionInputTimer.current);
      }
    };
  }, [caption]);

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri, width, height } = result.assets[0];
      setImageSource({ uri });
      setImageAspectRatio(width / height);
    }
  };

  const handleSave = () => {
    // Allow saving if either caption or image exists
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
  const remixButtonOpacity = useSharedValue(0);
  
  useEffect(() => {
    remixButtonOpacity.value = withTiming(showRemixButton ? 1 : 0, { duration: 300 });
  }, [showRemixButton]);
  
  const animatedRemixButtonStyle = useAnimatedStyle(() => ({
      opacity: remixButtonOpacity.value,
      transform: [{ translateY: interpolate(remixButtonOpacity.value, [0, 1], [5, 0]) }]
  }));

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const maxImageHeight = windowHeight * 0.45;
  const contentPadding = spacing.xl * 2;
  const pickerWidth = (windowWidth * 0.95) - contentPadding; // 95% is the modal width

  const imagePickerStyle = [
    styles.imagePicker,
    { 
      borderRadius: borderRadius.md, 
      backgroundColor: colors.background, 
      marginTop: spacing.lg,
    },
    imageSource 
      ? { height: undefined, maxHeight: maxImageHeight }
      : { height: pickerWidth * (5/7) },
  ];
  
  const imagePreviewStyle = [
      styles.imagePreview,
      imageAspectRatio ? { aspectRatio: imageAspectRatio } : {},
  ];

  return (
    <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSize.title, fontWeight: '500' }]}>
          Edit Post
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        {/* == Image Section == */}
        <TouchableOpacity onPress={handlePickImage} style={imagePickerStyle}>
          {imageSource ? (
            <Image source={imageSource} style={imagePreviewStyle} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.tabInactive} />
              <Text style={{ color: colors.tabInactive, marginTop: spacing.sm }}>Add an Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* == Caption Section == */}
        <View style={{ marginTop: spacing.lg }}>
          <TextInput
            style={[styles.input, { 
                backgroundColor: colors.backgroundDefault, 
                borderColor: colors.border, 
                color: colors.text, 
                fontSize: typography.fontSize.body, 
                paddingHorizontal: spacing.lg, 
                paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm + 4, 
                borderRadius: borderRadius.md,
                height: 100,
                textAlignVertical: 'top'
            }]}
            value={caption}
            onChangeText={setCaption}
            placeholder="What should this post say?"
            placeholderTextColor={colors.tabInactive}
            multiline
          />
           <Animated.View style={[styles.remixButtonContainer, animatedRemixButtonStyle]}>
              <TouchableOpacity style={[styles.remixButton, { backgroundColor: colors.accent, borderRadius: borderRadius.full, }]}>
                <Text style={[styles.remixButtonText, { color: colors.buttonAccentText, fontSize: typography.fontSize.caption, fontWeight: 'bold' }]}>
                  Remix with AI
                </Text>
              </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, padding: spacing.lg, flexDirection: 'row' }]}>
        <TouchableOpacity onPress={onClose} style={[styles.footerButtonBase, { backgroundColor: colors.background, marginRight: spacing.md, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: colors.text, fontWeight: '500', fontSize: typography.fontSize.body }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={!canSave} style={[styles.footerButtonBase, { backgroundColor: canSave ? colors.accent : colors.border, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: canSave ? colors.buttonAccentText : colors.tabInactive, fontWeight: 'bold', fontSize: typography.fontSize.body }}>
            Update Post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EditPostPopup: React.FC<EditPostPopupProps> = ({ isVisible, post, loopId, onClose, onSaveSuccess }) => {
  const animationProgress = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(isVisible);
  const { dispatch, state } = useLoops();

  const handleUpdatePost = (data: PostFormData) => {
    // Create updated post object with the same ID but new content
    const updatedPost: PostDisplayData = {
      id: post.id,
      caption: data.caption,
      imageSource: data.imageSource ?? post.imageSource,
    };
    onSaveSuccess(updatedPost);
    onClose();
  };

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
          <EditPostPopupContent post={post} onClose={onClose} onSave={handleUpdatePost} loopId={loopId} />
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

export default EditPostPopup; 