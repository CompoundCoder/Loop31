rr# Scheduled Posts Screen

**Purpose**  
This screen displays a list of all posts that have been scheduled for future publication. It provides a quick overview of upcoming content and helps users track their publishing momentum.

**Hooks Used**  
- `useTheme` & `useThemeStyles` – For accessing theme properties and styles.
- `useScheduledPosts` – Manages the state and fetching logic for the list of scheduled posts, including loading and refreshing states.
- `useScheduledPostsLayout` – Handles the animated scroll view logic, providing the `scrollY` value for the animated header.

**Components Rendered**  
- `ScreenContainer` – The main wrapper for the screen.
- `AnimatedHeader` – The collapsible header that displays the screen title.
- `FlatContainer` – A custom `FlatList` wrapper used to display the list of posts.
- `StreakCard` – A component displayed as the list header to show the user's scheduling momentum.
- `PostCard` – Renders an individual scheduled post in the list.
- `EmptyState` – Displayed when there are no scheduled posts.
- `ActivityIndicator` – Shown while the posts are loading initially.

**Data Sources**  
- `data/mockScheduled.ts` – The screen currently uses mocked data for the streak card and the list of posts. This data is fetched within the `useScheduledPosts` hook.

**Navigation**  
- This screen is likely accessed from a primary navigation menu, such as a "Posts" or "Planner" tab. The exact navigation path is not defined within the component itself.
- An action on the `EmptyState` component is intended to navigate the user to a "Create Post" screen (TODO).

**Related Types**  
- `Post` (from `data/Post.ts`) – The class that defines the structure and methods for a post object.

**Notes**  
- The screen was originally in the `archive/` directory and has been modernized and moved to `screens/`.
- It features a standard animated header that collapses on scroll.
- The rendering logic for list items (`renderPost`) and empty states (`renderEmptyState`) has been extracted into separate functions for clarity. 