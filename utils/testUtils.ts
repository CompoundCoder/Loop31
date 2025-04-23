import AsyncStorage from '@react-native-async-storage/async-storage';

export const addTestPublishedPost = async () => {
  try {
    // Create test post object
    const testPost = {
      id: Date.now().toString(),
      caption: "This is a test post from CLI",
      mediaUri: "",
      createdAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
      source: "manual",
      platforms: [{
        id: "1",
        type: "facebook",
        name: "Test FB Page",
        icon: "logo-facebook"
      }]
    };

    // Load existing posts
    const existingPostsJson = await AsyncStorage.getItem('publishedPosts');
    const existingPosts = existingPostsJson ? JSON.parse(existingPostsJson) : [];

    // Prepend new test post
    const updatedPosts = [testPost, ...existingPosts];

    // Save back to AsyncStorage
    await AsyncStorage.setItem('publishedPosts', JSON.stringify(updatedPosts));

    console.log('✅ Test post added successfully:', testPost);
    return testPost;

  } catch (error) {
    console.error('❌ Error adding test post:', error);
    throw error;
  }
}; 