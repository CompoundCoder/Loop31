import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import CreateLoopPopup from '../components/CreateLoopPopup'; // Adjust path if needed

const TestPopupScreen = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(true);

  const handleClose = () => {
    console.log('onClose triggered');
    setIsPopupVisible(false);
  };

  const handleSaveSuccess = (newLoopId: string) => {
    console.log(`onSaveSuccess triggered with new loop ID: ${newLoopId}`);
    setIsPopupVisible(false);
  };

  const togglePopup = () => {
    setIsPopupVisible(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <Button title={isPopupVisible ? "Hide Popup" : "Show Popup"} onPress={togglePopup} />

      {isPopupVisible && (
        <CreateLoopPopup
          visible={isPopupVisible}
          onClose={handleClose}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default TestPopupScreen; 