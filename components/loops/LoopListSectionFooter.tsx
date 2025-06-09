import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface LoopListSectionFooterProps {
  style?: StyleProp<ViewStyle>;
  // Add any other props if footer content becomes dynamic in the future
}

const LoopListSectionFooter: React.FC<LoopListSectionFooterProps> = ({ style }) => {
  // Currently, no specific footer content is rendered.
  // This component can be expanded if footer UI (e.g., "Load More") is needed.
  return <View style={style} />;
  // Alternatively, return null if no view/styling is desired for an empty footer:
  // return null;
};

export default LoopListSectionFooter; 