import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// MOCK DATA and configuration
const milestones = [
    { id: '1', text: 'Joined Loop31', completed: true },
    { id: '2', text: 'Created your first Loop', completed: true },
    { id: '3', text: 'Shared 100 posts', completed: false },
    { id: '4', text: 'Completed a 7-day streak', completed: false },
    { id: '5', text: 'Received 50 reactions', completed: false },
    { id: '6', text: 'Used 5 different loops', completed: false },
    { id: '7', text: 'Scheduled a post for the future', completed: false },
    { id: '8', text: 'Edited a published post', completed: false },
    { id: '9', text: 'Archived a loop', completed: false },
    { id: '10', text: 'Created a post with an image', completed: false },
    { id: '11', text: 'Reached 250 followers on a platform', completed: false },
    { id: '12', text: 'Shared a post to 3 platforms at once', completed: false },
    { id: '13', text: 'Used the "Up Next" feature', completed: false },
    { id: '14', text: 'Achieved a 14-day streak', completed: false },
    { id: '15', text: 'Received 100 reactions', completed: false },
    { id: '16', text: 'Unlocked a new badge', completed: false },
    { id: '17', text: 'Followed a recommended loop', completed: false },
    { id: '18', text: 'Customized your brand tone', completed: false },
    { id: '19', text: 'Shared 250 posts', completed: false },
    { id: '20', text: 'Completed a 30-day streak', completed: false },
];

const ITEM_HEIGHT = 40;

const firstIncompleteIndex = milestones.findIndex(m => !m.completed);

export default function YourJourneyCard() {
    const { colors, spacing, borderRadius, elevation } = useThemeStyles();

    const displayIndex = firstIncompleteIndex === -1 ? milestones.length - 1 : firstIncompleteIndex;
    
    const itemsToShow = [
        milestones[displayIndex - 1],
        milestones[displayIndex],
        milestones[displayIndex + 1],
    ].filter(Boolean);

    const currentItemInDisplayIndex = itemsToShow.findIndex(item => item.id === milestones[displayIndex].id);
    
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
        const entryAnimationConfig = {
            duration: 500,
            easing: Easing.out(Easing.cubic),
        };
        opacity.value = withTiming(1, entryAnimationConfig);
        translateY.value = withTiming(0, entryAnimationConfig);
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={animatedCardStyle}>
            <View style={[styles.outerContainer, { backgroundColor: colors.card, borderRadius: borderRadius.lg, ...elevation.md }]}>
                <Text style={[styles.title, { color: colors.text, marginBottom: spacing.md }]}>Your Journey</Text>
                
                <View>
                    {itemsToShow.map((item, index) => {
                        const isCurrent = index === currentItemInDisplayIndex;
                        let itemOpacity = 1;

                        if (index < currentItemInDisplayIndex) {
                            itemOpacity = 0.6; // Previous item, grayed out
                        } else if (index > currentItemInDisplayIndex) {
                            itemOpacity = 0.4; // Next item, faded
                        }
                        
                        const fontWeight = isCurrent ? 'bold' : 'normal';

                        return (
                            <View key={item.id} style={[styles.milestone, { height: ITEM_HEIGHT, opacity: itemOpacity }]}>
                                <Ionicons 
                                    name={item.completed ? "checkmark-circle" : "radio-button-off-outline"} 
                                    size={22} 
                                    color={item.completed ? colors.success : colors.text} 
                                />
                                <Text style={[{ color: colors.text, marginLeft: spacing.md, flex: 1, fontWeight }]}>
                                    {item.text}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600'
    },
    milestone: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}); 