import React, { createContext, useState, useContext, ReactNode, useRef, useEffect, useCallback } from 'react';

// Define the shape of the context data
interface LoopModalContextType {
  isCreateLoopModalVisible: boolean;
  setCreateLoopModalVisible: (isVisible: boolean) => void;
}

// Create the context with a default undefined value
// It's important to handle this case if a component tries to use the context
// without a Provider higher up in the tree.
const LoopModalContext = createContext<LoopModalContextType | undefined>(undefined);

// Define the props for the provider component
interface LoopModalProviderProps {
  children: ReactNode;
}

// Create the provider component
export const LoopModalProvider: React.FC<LoopModalProviderProps> = ({ children }) => {
  const [isCreateLoopModalVisible, setCreateLoopModalVisible] = useState<boolean>(false);

  return (
    <LoopModalContext.Provider value={{ isCreateLoopModalVisible, setCreateLoopModalVisible }}>
      {children}
    </LoopModalContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useLoopModal = (): LoopModalContextType => {
  const context = useContext(LoopModalContext);
  if (context === undefined) {
    throw new Error('useLoopModal must be used within a LoopModalProvider');
  }
  return context;
};
