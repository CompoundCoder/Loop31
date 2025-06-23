import { useState, useEffect, useRef } from 'react';
import { ImageSourcePropType, Alert, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { PostDisplayData } from '@/app/(loops)/[loopId]';

export const usePostMenuLogic = (post?: PostDisplayData | null) => {
  const mode = post ? 'edit' : 'create';

  const [caption, setCaption] = useState('');
  const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [showRemixButton, setShowRemixButton] = useState(false);

  const captionInputTimer = useRef<NodeJS.Timeout | null>(null);
  const remixButtonOpacity = useSharedValue(0);

  // Initialize state based on mode (create vs. edit)
  useEffect(() => {
    console.log('[PostMenuLogic] Running effect, mode:', mode);

    if (mode === 'edit' && post) {
      console.log('[PostMenuLogic] Edit mode, incoming post:', JSON.stringify(post, null, 2));
      setCaption(post.caption || '');
      
      const imageSourceProp = (post as any).imageSource;
      const imageUrlProp = (post as any).imageUrl;
      let finalImageSource: ImageSourcePropType | null = null;

      if (typeof imageSourceProp === 'number') {
        finalImageSource = imageSourceProp;
        // NOTE: Cannot get aspect ratio from require() result synchronously
        setImageAspectRatio(null);
      } else if (typeof imageSourceProp === 'object' && imageSourceProp.uri) {
        finalImageSource = imageSourceProp;
        Image.getSize(imageSourceProp.uri, (width, height) => {
          setImageAspectRatio(width / height);
        }, (error) => {
          console.error(`[PostMenuLogic] Could not get image size: ${error}`);
          setImageAspectRatio(null);
        });
      } else if (typeof imageUrlProp === 'string' && imageUrlProp.length > 0) {
        finalImageSource = { uri: imageUrlProp };
        Image.getSize(imageUrlProp, (width, height) => {
          setImageAspectRatio(width / height);
        }, (error) => {
          console.error(`[PostMenuLogic] Could not get image size: ${error}`);
          setImageAspectRatio(null);
        });
      }

      console.log('[PostMenuLogic] Resolved imageSource:', finalImageSource);
      setImageSource(finalImageSource);

    } else {
      setCaption('');
      setImageSource(null);
      setImageAspectRatio(null);
    }
  }, [post, mode]);

  // Debounced effect to show the "Remix with AI" button
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
  
  // Animation for the Remix button
  useEffect(() => {
    remixButtonOpacity.value = withTiming(showRemixButton ? 1 : 0, { duration: 300 });
  }, [showRemixButton]);

  const animatedRemixButtonStyle = useAnimatedStyle(() => ({
    opacity: remixButtonOpacity.value,
    transform: [{ translateY: interpolate(remixButtonOpacity.value, [0, 1], [5, 0]) }],
  }));

  // Image Picker Logic
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

  return {
    mode,
    caption,
    setCaption,
    imageSource,
    imageAspectRatio,
    animatedRemixButtonStyle,
    handlePickImage,
  };
}; 