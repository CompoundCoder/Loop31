import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import AppNavigator from './navigation/AppNavigator';
import { AccountProvider } from './context/AccountContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { processAllPosts } from './utils/postPublisher';
// --- TEMP TEST POST INJECTION (commented out for now) ---
// import { addTestPublishedPost } from './utils/testUtils';

export default function App() {
  // Ref to store interval ID for cleanup
  const publishingInterval = useRef<NodeJS.Timeout>();

  // --- TEMP TEST POST INJECTION (commented out for now) ---
  // useEffect(() => {
  //   addTestPublishedPost()
  //     .then(() => {
  //       console.log('✅ Test post added');
  //     })
  //     .catch(err => {
  //       console.error('❌ Failed to add test post:', err);
  //     });
  // }, []);

  // Initialize automated post publishing
  useEffect(() => {
    // Initial run when app starts
    const runPublisher = async () => {
      try {
        await processAllPosts();
        console.log('[Post Publisher] Ran successfully');
      } catch (error) {
        console.error('[Post Publisher] Error:', error);
      }
    };

    // Run immediately
    runPublisher();

    // Set up interval for subsequent runs
    publishingInterval.current = setInterval(runPublisher, 60000);

    // Cleanup on unmount
    return () => {
      if (publishingInterval.current) {
        clearInterval(publishingInterval.current);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <MenuProvider>
        <AccountProvider>
          <NotificationsProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </NotificationsProvider>
        </AccountProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}
