# Loop Detail Screen

**Purpose**  
This screen serves as the central view for managing the posts within a specific loop. It displays the "Up Next" post, the entire queue of posts, and allows the user to activate/deactivate the loop and access editing options.

**Hooks Used**  
- `useThemeStyles` – For accessing common theme properties like colors and spacing.
- `useSafeAreaInsets` – To handle safe area padding, especially for the list's bottom padding.
- `useNavigation` – To provide the `goBack()` function for the back button.
- `useLocalSearchParams` – To get the `loopId` from the navigation route.
- `useLoops` – To access the global `LoopsContext`, providing the loop data and the `dispatch` function.
- `useFadeIn` – A custom hook to apply a fade-in animation, used on the "Up Next" post card.

**Components Rendered**  
- `SafeAreaView` – The main wrapper to avoid screen notches and system bars.
- `LinearGradient` – Renders a background gradient based on the loop's assigned color.
- `ScrollView` – The main container for the screen content.
- `Switch` – The toggle to activate or deactivate the loop.
- `LoopEditMenu` – A modal or menu for editing loop properties (e.g., title, color).
- `PostCardS` – A modular component used to render the "Up Next" post with a "featured" variant.
- `TestPostCardMini` – A different modular card used to render posts in the "Queue" list.

**Data Sources**  
- `LoopsContext` – The primary source of truth for the loop's details (title, color, posts, etc.), accessed via the `useLoops` hook.

**Navigation**  
- **Access:** This screen is accessed by pressing on a loop from the main "Loops" screen. The `loopId` is passed as a route parameter.
- **Actions:**
  - The back button navigates to the previous screen.
  - The three-dot menu opens the `LoopEditMenu`.

**Related Types**  
- `Loop` (from `LoopsContext`) – The main data type for a loop.
- `PostDisplayData` (from `LoopsContext`) – The type for post objects displayed in this screen.

**Notes**  
- **Visual Style:** The screen features a dynamic background `LinearGradient` that uses the loop's specific color, creating a personalized feel for each loop.
- **Modularity:** The screen uses two different modular post card components (`PostCardS` and `TestPostCardMini`), indicating an opportunity to consolidate into a single, more versatile `PostCard` component with different variants.
- **Post Grouping:** The screen separates the first post into an "Up Next" section, giving it prominence, while the rest are in a scrollable "Queue". The queue itself is currently rendered with `posts.map()`, which is not ideal for performance with long lists and lacks drag-and-drop functionality mentioned in the prompt. This is a candidate for a `FlashList` or `DraggableFlatList` implementation.
- **State Management:** The screen uses a mix of local state (`useState`) for UI concerns (like menu visibility) and context (`useLoops`) for the core data. Toggling the loop's active state dispatches an action to the global context. 