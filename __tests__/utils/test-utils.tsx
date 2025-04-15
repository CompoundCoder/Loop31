import React, { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type ProvidersProps = {
  children: React.ReactNode;
};

const AllTheProviders = ({ children }: ProvidersProps) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render }; 