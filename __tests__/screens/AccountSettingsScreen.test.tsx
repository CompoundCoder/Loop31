import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '../utils/test-utils';
import AccountSettingsScreen from '../../screens/settings/AccountSettingsScreen';

describe('AccountSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial values', () => {
    const { getByTestId, getByText } = render(<AccountSettingsScreen />);
    
    expect(getByTestId('fullname-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByText('Delete Account')).toBeTruthy();
  });

  it('handles text input changes', () => {
    const { getByTestId, getByText } = render(<AccountSettingsScreen />);
    
    const fullNameInput = getByTestId('fullname-input');
    const emailInput = getByTestId('email-input');
    
    fireEvent.changeText(fullNameInput, 'Jane Doe');
    fireEvent.changeText(emailInput, 'jane.doe@example.com');
    
    expect(fullNameInput.props.value).toBe('Jane Doe');
    expect(emailInput.props.value).toBe('jane.doe@example.com');
  });

  it('enables save button when changes are made', () => {
    const { getByTestId } = render(<AccountSettingsScreen />);
    
    const fullNameInput = getByTestId('fullname-input');
    const saveButton = getByTestId('save-button');
    
    expect(saveButton.props.disabled).toBe(true);
    
    fireEvent.changeText(fullNameInput, 'Jane Doe');
    
    expect(saveButton.props.disabled).toBe(false);
  });

  it('shows reset password confirmation', () => {
    const { getByTestId } = render(<AccountSettingsScreen />);
    
    fireEvent.press(getByTestId('reset-password-button'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Reset Password',
      'Are you sure you want to reset your password? We will send you an email with instructions.',
      expect.any(Array)
    );
  });

  it('shows delete account confirmation', () => {
    const { getByTestId } = render(<AccountSettingsScreen />);
    
    fireEvent.press(getByTestId('delete-account-button'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      expect.any(Array)
    );
  });

  it('handles save button press', async () => {
    const { getByTestId } = render(<AccountSettingsScreen />);
    
    const fullNameInput = getByTestId('fullname-input');
    fireEvent.changeText(fullNameInput, 'Jane Doe');
    
    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Account settings saved successfully'
      );
    });
  });
}); 