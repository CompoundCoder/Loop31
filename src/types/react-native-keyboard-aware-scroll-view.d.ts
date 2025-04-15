declare module 'react-native-keyboard-aware-scroll-view' {
  import { ScrollViewProps, KeyboardAvoidingViewProps } from 'react-native';
  import React from 'react';

  export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
    viewIsInsideTabBar?: boolean;
    resetScrollToCoords?: { x: number; y: number } | null;
    enableResetScrollToCoords?: boolean;
    enableAutomaticScroll?: boolean;
    extraHeight?: number;
    extraScrollHeight?: number;
    keyboardOpeningTime?: number;
    enableOnAndroid?: boolean;
    innerRef?: (ref: any) => void;
  }

  export class KeyboardAwareScrollView extends React.Component<KeyboardAwareScrollViewProps> {}

  export interface KeyboardAwareProps extends KeyboardAvoidingViewProps {
    viewIsInsideTabBar?: boolean;
    resetScrollToCoords?: { x: number; y: number } | null;
    enableResetScrollToCoords?: boolean;
    enableAutomaticScroll?: boolean;
    extraHeight?: number;
    extraScrollHeight?: number;
    keyboardOpeningTime?: number;
    enableOnAndroid?: boolean;
  }

  export class KeyboardAwareFlatList extends React.Component<KeyboardAwareProps> {}
  export class KeyboardAwareSectionList extends React.Component<KeyboardAwareProps> {}
} 