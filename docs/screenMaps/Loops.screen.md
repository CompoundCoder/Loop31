# Loops Screen

**Purpose**  
The Loops screen is the central hub for users to view, manage, and interact with their saved loops. It displays a list of all loops, provides search functionality, and allows for the creation of new loops.

**Hooks Used**  
- `useThemeStyles` – Accesses the application's theme for styling.
- `useLoopHeader` – Manages the animated header's scroll behavior.
- `useLoopsHeader` – Handles the "Create" popover menu logic in the header.
- `useLoops` – Provides access to the global loops state and dispatch function from `LoopsContext`.
- `useNotifications` – Provides the `addNotification` function for showing toasts/alerts.
- `useLoopManager` – Encapsulates the logic for deleting and duplicating loops.
- `useLoopSearch` – Handles the search functionality, filtering loops based on user input.
- `useLoopActionModal` – Manages the state and actions for the long-press action modal.
- `useLoopActions` – Provides handlers for primary loop interactions like press, long-press, pin, and toggle active state.
- `useLoopListRenderers` – Generates the `renderItem` and `keyExtractor` functions for the main list, and prepares the list data.
- `useLoopLayout` – Determines the overall layout state, such as whether to show an empty state or no-results message.

**Components Rendered**  
- `ScreenContainer` – The main wrapper for the screen content.
- `AnimatedHeader` – A collapsible header that displays the screen title and an action button.
- `HeaderActionButton` – The "add" button in the header that triggers the `Popover`.
- `LoopListSection` – A component that renders the `FlashList` of loops.
- `LoopsEmptyState` – An empty state message shown when the user has no loops.
- `EmptyState` – A generic empty state for scenarios like "no search results."
- `Modalize` – The bottom sheet modal for loop actions (edit, delete, etc.).
- `LoopActionsModalContent` – The content rendered inside the `Modalize` modal.
- `Popover` – The pop-up menu for creating a new Loop or Post.

**Data Sources**  
- `LoopsContext` – The primary source of truth for all loop data, including the list of loops and pinned loop IDs. Accessed via the `useLoops` hook.

**Navigation**  
- **Access:** This screen is a primary tab in the bottom tab navigator, labeled "Loops".
- **Routes:**
  - Pushing `/(modals)/create-loop` to show the create loop form.
  - Pushing `/loops/edit/[loopId]` to navigate to the loop editor.
  - Pushing `/[loopId]` to view a specific loop's details.
  - Pushing `/shop/pack/[packId]` when a discover pack is pressed.

**Related Types**  
- `LoopsStackParamList` – Defines the navigation parameter list for the stack.
- `HookThemeStyles` – A custom type passed to `useLoopListRenderers` containing theme colors and spacing.

**Notes**  
- The screen features a `Modalize` bottom sheet for quick actions on a loop, which is triggered by a long-press.
- It uses a `Popover` from `react-native-popover-view` for the "Create" menu in the header.
- Swipe-to-reveal actions are managed via `SwipeableRowRef` and the `useLoopListRenderers` hook, allowing actions like pinning directly from the list.
- The list is rendered using `LoopListSection`, which contains a `FlashList` for optimized performance. 