import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SettingItemProps {
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  rightElement?: string;
  detail?: string;
  labelStyle?: any;
  detailStyle?: any;
  style?: any;
}

export function SettingItem({ 
  label, 
  icon, 
  iconColor = '#007AFF', 
  onPress, 
  rightElement, 
  detail,
  labelStyle,
  detailStyle,
  style
}: SettingItemProps) {
  return (
    <TouchableOpacity style={[styles.settingItem, style]} onPress={onPress}>
      <View style={styles.settingItemContent}>
        <View style={styles.settingItemLeft}>
          <Ionicons name={icon as any} size={24} color={iconColor} style={styles.settingItemIcon} />
          <Text style={[styles.settingItemLabel, labelStyle]}>{label}</Text>
        </View>
        <View style={styles.settingItemRight}>
          {detail && <Text style={[styles.settingItemDetail, detailStyle]}>{detail}</Text>}
          {rightElement && <Ionicons name={rightElement as any} size={20} color="#007AFF" />}
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const SettingsSection = ({ 
  title, 
  children,
  titleStyle,
  style
}: { 
  title: string;
  children: React.ReactNode;
  titleStyle?: any;
  style?: any;
}) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

export const SettingsContainer = ({ 
  children,
  style
}: { 
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <ScrollView style={[styles.container, style]} bounces={true}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5ea',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  settingItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemDetail: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
}); 