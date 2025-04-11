import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateStackParamList } from '../../navigation/CreateNavigator';

type Props = {
  navigation: NativeStackNavigationProp<CreateStackParamList, 'PlatformSelect'>;
};

type Platform = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  connected: boolean;
};

const PLATFORMS: Platform[] = [
  { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', connected: true },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', connected: true },
  { id: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin', connected: true },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', connected: false },
  { id: 'pinterest', name: 'Pinterest', icon: 'logo-pinterest', connected: false },
  { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok', connected: false },
];

export default function PlatformSelectScreen({ navigation }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(current =>
      current.includes(platformId)
        ? current.filter(id => id !== platformId)
        : [...current, platformId]
    );
  };

  const handleNext = () => {
    if (selectedPlatforms.length > 0) {
      navigation.navigate('MediaPicker', { platforms: selectedPlatforms });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Connected Accounts</Text>
        {PLATFORMS.map(platform => (
          <TouchableOpacity
            key={platform.id}
            style={[
              styles.platformRow,
              !platform.connected && styles.platformDisabled
            ]}
            onPress={() => platform.connected && togglePlatform(platform.id)}
            disabled={!platform.connected}
          >
            <View style={styles.platformInfo}>
              <Ionicons name={platform.icon} size={24} color={platform.connected ? '#666' : '#ccc'} />
              <Text style={[
                styles.platformName,
                !platform.connected && styles.platformNameDisabled
              ]}>
                {platform.name}
              </Text>
            </View>
            {platform.connected && (
              <View style={styles.checkboxContainer}>
                {selectedPlatforms.includes(platform.id) ? (
                  <View style={styles.checkboxChecked}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
            )}
            {!platform.connected && (
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { opacity: selectedPlatforms.length > 0 ? 1 : 0.5 }
          ]}
          onPress={handleNext}
          disabled={selectedPlatforms.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformDisabled: {
    backgroundColor: '#fafafa',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  platformNameDisabled: {
    color: '#999',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    backgroundColor: '#2f95dc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  connectButtonText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 