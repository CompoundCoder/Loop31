import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function LoopCard() {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
      }
    ]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Loop Placeholder
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
}); 