import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from '../../lib/types';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
}

const PLATFORMS: { id: Platform; name: string; icon: string; color: string }[] = [
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
  { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
];

export default function PlatformSelector({ selectedPlatforms, onPlatformsChange }: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    const isSelected = selectedPlatforms.includes(platform);
    if (isSelected) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Post to:</Text>
      <View style={styles.platformList}>
        {PLATFORMS.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformButton,
                isSelected && { backgroundColor: platform.color },
              ]}
              onPress={() => togglePlatform(platform.id)}
            >
              <Ionicons
                name={platform.icon as any}
                size={24}
                color={isSelected ? 'white' : platform.color}
              />
              <Text
                style={[
                  styles.platformName,
                  isSelected && styles.platformNameSelected,
                ]}
              >
                {platform.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  platformList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 120,
  },
  platformName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  platformNameSelected: {
    color: 'white',
  },
}); 