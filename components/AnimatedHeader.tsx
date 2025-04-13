import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  titleStyle?: any;
  containerStyle?: any;
}

const HEADER_HEIGHT = 44;

export default function Header({ title, titleStyle, containerStyle }: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.header,
        containerStyle,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
        },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text 
          style={[
            styles.title,
            titleStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
  },
  titleContainer: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
}); 