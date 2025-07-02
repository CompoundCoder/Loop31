import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { Post } from '@/data/mockPosts';
import { Ionicons } from '@expo/vector-icons';
import MetricsRow from './MetricsRow';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { SCREEN_LAYOUT } from '@/constants/layout';
import InlineDropdownMenu from '../ui/InlineDropdownMenu';
import ActionMenuItems from '../ui/ActionMenuItems';

type PostPreviewModalProps = {
    post?: Post | null;
    isVisible: boolean;
    onClose: () => void;
    onAddToLoop?: (postId: string) => void;
    onDelete?: (postId:string) => void;
};

export default function PostPreviewModal({ post, isVisible, onClose, onAddToLoop, onDelete }: PostPreviewModalProps) {
    const { colors, spacing, borderRadius, elevation } = useThemeStyles();
    const [modalRendered, setModalRendered] = useState(false);
    const [postToShow, setPostToShow] = useState<Post | null>(null);
    const [imageAspectRatio, setImageAspectRatio] = useState(16 / 9);

    const scale = useSharedValue(0.97);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
        if (isVisible && post) {
            setPostToShow(post);
            setModalRendered(true);
            scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
            opacity.value = withTiming(1, { duration: 250 });
            translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
        } else if (postToShow) {
            scale.value = withTiming(0.97, { duration: 200, easing: Easing.in(Easing.cubic) });
            opacity.value = withTiming(0, { duration: 200 }, (finished) => {
                'worklet';
                if (finished) {
                    runOnJS(setModalRendered)(false);
                    runOnJS(setPostToShow)(null);
                }
            });
            translateY.value = withTiming(10, { duration: 200, easing: Easing.in(Easing.cubic) });
        }
    }, [isVisible, post]);

    useEffect(() => {
        if (post?.imageUrl) {
            Image.getSize(post.imageUrl, (width, height) => {
                setImageAspectRatio(width / height);
            }, (error) => {
                console.error(`Failed to get image size: ${error}`);
                setImageAspectRatio(16 / 9);
            });
        }
    }, [post?.imageUrl]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!modalRendered) return null;

    const screenWidth = Dimensions.get('window').width;
    const modalWidth = screenWidth - (SCREEN_LAYOUT.content.horizontalPadding * 2);
    const maxImageHeight = Dimensions.get('window').height * 0.55;
    
    const subcaptionText = "Shared 2h ago";

    const handleAddToLoop = () => {
        if (postToShow && onAddToLoop) onAddToLoop(postToShow.id);
    }
    const handleDelete = () => {
        if (postToShow && onDelete) onDelete(postToShow.id);
    }

    const menuActions = [
        {
            label: 'Add to Loop',
            icon: <Ionicons name="add-circle-outline" size={20} color={colors.text} />,
            onPress: handleAddToLoop,
        },
        {
            label: 'Hide',
            icon: <Ionicons name="eye-off-outline" size={20} color={colors.error} />,
            onPress: handleDelete,
            color: colors.error,
        },
    ];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={modalRendered}
            onRequestClose={onClose}
        >
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
            </Pressable>
            
            <View style={[styles.centeredView, { paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding }]} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.modalView,
                        { backgroundColor: colors.card, borderRadius: borderRadius.md },
                        elevation.lg,
                        animatedStyle
                    ]}>
                    <View style={styles.headerButtons}>
                        <Pressable style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.35)' }]} onPress={onClose}>
                            <Ionicons name="close" size={22} color={'#FFF'} />
                        </Pressable>
                        <InlineDropdownMenu
                            anchor="right"
                            menuWidth={180}
                            trigger={
                                <Pressable style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                                    <Ionicons name="ellipsis-horizontal" size={22} color={'#FFF'} />
                                </Pressable>
                            }
                        >
                           <ActionMenuItems actions={menuActions} />
                        </InlineDropdownMenu>
                    </View>

                    {postToShow?.imageUrl && (
                      <Image 
                        source={{ uri: postToShow.imageUrl }} 
                        style={[
                            styles.image, 
                            { 
                                height: Math.min(modalWidth / imageAspectRatio, maxImageHeight),
                                borderTopLeftRadius: borderRadius.md,
                                borderTopRightRadius: borderRadius.md,
                            }
                        ]}
                      />
                    )}
                    
                    <ScrollView style={styles.contentContainer}>
                        <Text style={[styles.caption, { color: colors.text, marginTop: spacing.xs}]}>{postToShow?.caption}</Text>
                        <Text style={[styles.subCaption, { color: colors.tabInactive, marginTop: spacing.sm }]}>{subcaptionText}</Text>

                        <View style={[styles.metricsContainer, { borderTopColor: colors.border, marginTop: spacing.lg, paddingTop: spacing.sm }]}>
                          <MetricsRow views={12300} likes={456} reposts={89} />
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '100%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20, 
    },
    headerButtons: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        resizeMode: 'cover',
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    caption: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '500',
    },
    subCaption: {
      fontSize: 13,
      fontWeight: '400',
    },
    metricsContainer: {
      borderTopWidth: StyleSheet.hairlineWidth,
    },
}); 