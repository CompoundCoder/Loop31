---
# HomeScreen Architecture

## Purpose
The `HomeScreen` serves as the main dashboard for the user, displaying notifications, performance insights, and other relevant content in a sectioned list.

## Hooks Used
- `useThemeStyles` — for accessing theme-related styles.
- `useHomeScreenNotifications` — for managing the notification stack.
- `useHomeScreenSections` — for generating the sectioned list data for the `FlatList`.
- `useSharedValue` & `useAnimatedScrollHandler` (from `react-native-reanimated`) — for managing the animated header's scroll-based animations.

## Components Rendered
The `HomeScreen` primarily renders a `Reanimated.FlatList`. The list items themselves are rendered via the `renderHomeScreenItem` function, which in turn renders components like:
- `NotificationStackInline`
- `TopPerformingPostsSection`
- `AppleInsightsSection`

Core components used:
- `ScreenContainer`
- `AnimatedHeader`

## Data Sources
The data for this screen is primarily sourced from custom hooks (`useHomeScreenNotifications`, `useHomeScreenSections`), which encapsulate the logic for fetching and preparing data for display. No direct API calls or AsyncStorage access is performed within this component.

## Navigation
The `HomeScreen` is a primary screen, typically accessed via the main bottom tab navigation bar as the "Home" tab.

## Related Types
- `HomeScreenItem` (from `types/homeScreen.ts`) — defines the shape of the items rendered in the list.

## Notes
- The screen features a sophisticated animated header that collapses and expands based on the scroll position of the `FlatList`, implemented using `react-native-reanimated`.
- The rendering of different list item types is delegated to a separate `renderHomeScreenItem` function to keep the main component clean and focused on layout and state management.
--- 