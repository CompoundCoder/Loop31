import React, { useState, useEffect } from 'react';
import Modal from 'react-native-modal';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  TouchableWithoutFeedback, 
  Image, 
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { type Post } from '@/app/(loops)/[loopId]';

interface PostEditMenuProps {
  isVisible: boolean;
  post: Post | null;
  onClose: () => void;
  onUpdateCaption: (postId: string, newCaption: string) => void;
  typography: any;
}

const PostEditMenu: React.FC<PostEditMenuProps> = ({ 
  isVisible, 
  post, 
  onClose, 
  onUpdateCaption, 
  typography
}) => {
  const insets = useSafeAreaInsets();
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles, typography, insets);
  const [captionDraft, setCaptionDraft] = useState(post?.caption || '');
  const [originalCaption, setOriginalCaption] = useState(post?.caption || '');

  useEffect(() => {
    const currentCaption = post?.caption || '';
    setCaptionDraft(currentCaption);
    setOriginalCaption(currentCaption);
  }, [post]);

  const handleCaptionChange = (text: string) => {
    setCaptionDraft(text);
    if (post) {
      onUpdateCaption(post.id, text);
    }
  };

  const handleUndo = () => {
    if (post) {
      setCaptionDraft(originalCaption);
      onUpdateCaption(post.id, originalCaption);
    }
  };

  const showUndo = captionDraft !== originalCaption;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      avoidKeyboard
      propagateSwipe
    >
      <View style={styles.content}>
        <View style={styles.grabber} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {post?.previewImageUrl && (
            <Image 
              source={{ uri: post.previewImageUrl }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          )}

          <View style={styles.captionInputContainer}>
            <Text style={styles.inputLabel}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              value={captionDraft}
              onChangeText={handleCaptionChange}
              placeholder="Enter caption..."
              placeholderTextColor={themeStyles.colors.text}
              multiline={true}
              scrollEnabled={false}
            />
          </View>

          {showUndo && (
            <View style={styles.undoContainer}>
              <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
                <Text style={styles.undoButtonText}>Undo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.remixButton}>
            <Text style={styles.remixButtonText}>Remix with AI</Text>
          </TouchableOpacity>

          <Text style={styles.savedText}>All changes saved automatically</Text>
        </ScrollView>

      </View>
    </Modal>
  );
};

const createStyles = (theme: ThemeStyles, typography: any, insets: { top: number; right: number; bottom: number; left: number; }) => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    content: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: insets.bottom + spacing.md,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    grabber: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    imagePreview: {
      width: '100%',
      aspectRatio: 1.91,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.lg,
    },
    captionInputContainer: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      fontSize: 12,
      color: theme.colors.text,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      fontWeight: '500',
    },
    captionTextDisplay: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
      minHeight: 60,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
    },
    captionInput: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
      minHeight: 80,
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      textAlignVertical: 'top',
    },
    remixButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 99,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: spacing.lg,
    },
    remixButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '600',
    },
    savedText: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: 'center',
    },
    undoContainer: {
      alignItems: 'center',
      marginTop: 12,
      marginBottom: spacing.md,
    },
    undoButton: {
      backgroundColor: colors.border,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.lg,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    undoButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
  });
};

export default PostEditMenu; 