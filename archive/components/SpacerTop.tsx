import React from 'react';
import { View } from 'react-native';

type SpacerTopProps = {
  size?: number;
};

export default function SpacerTop({ size = 16 }: SpacerTopProps) {
  return <View style={{ height: size }} />;
} 