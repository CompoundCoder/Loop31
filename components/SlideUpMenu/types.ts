import type React from 'react';

export interface SlideUpMenuProps {
  isVisible: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onOpenRequest?: () => void; // Added: For ref.open() to request parent to open
  title?: string;
  showSaveButton?: boolean;
  children: React.ReactNode;
  height?: number | string; // e.g., 300 or '50%'
  dismissOnBackdropTap?: boolean;
  dismissOnSwipeDown?: boolean;
  // Future: renderHeader?: (props: MenuHeaderProps) => React.ReactElement;
}

export interface SlideUpMenuRef { // Ensure this is exported
  open: () => void;
  close: () => void;
}

export interface MenuHeaderProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  showSaveButton?: boolean;
  // Future: isSaveDisabled?: boolean;
}

export interface MenuWrapperProps extends Omit<SlideUpMenuProps, 'isVisible' | 'title' | 'showSaveButton' | 'onSave'> {
  // Internal props for the wrapper
  actualHeight: number | string;
  onDismiss: () => void; // Combined close/dismiss handler
}

// Placeholder for theme types - replace with actual theme structure
export interface Theme {
  colors: {
    background: string;
    card: string;
    text: string;
    primary: string;
    border: string;
    backdrop: string; // For the semi-transparent backdrop
    // ... other colors
  };
  spacing: {
    s: number;
    m: number;
    l: number;
    xl: number;
    // ... other spacing units
  };
  borderRadius: {
    s: number;
    m: number;
    l: number;
    // ... other border radius values
  };
  elevation: {
    medium: object; // Placeholder for shadow/elevation styles
    // ... other elevation levels
  };
  typography: any; // Placeholder
}
