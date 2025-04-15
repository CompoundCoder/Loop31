import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, fireEvent, waitFor } from '../utils/test-utils';
import DraftsScreen from '../../screens/DraftsScreen';
import { NavigationProp } from '@react-navigation/native';
import { RootTabParamList } from '../../navigation/BottomTabNavigator';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

const mockDrafts = [
  {
    id: '1',
    mediaUri: 'https://example.com/image1.jpg',
    caption: 'Test draft 1',
    accountIds: [
      { id: 'ig1', type: 'instagram' as const, name: 'Instagram Account 1' },
    ],
    scheduledDate: '2024-04-14T12:00:00Z',
    createdAt: '2024-04-14T10:00:00Z',
    status: 'draft' as const,
  },
  {
    id: '2',
    mediaUri: 'https://example.com/image2.jpg',
    caption: 'Test draft 2',
    accountIds: [
      { id: 'fb1', type: 'facebook' as const, name: 'Facebook Account 1' },
    ],
    scheduledDate: '2024-04-15T12:00:00Z',
    createdAt: '2024-04-14T11:00:00Z',
    status: 'draft' as const,
  },
];

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('DraftsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDrafts));
  });

  it('renders drafts list correctly', async () => {
    const { findByText } = render(<DraftsScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('drafts');
    });

    expect(await findByText('Test draft 1')).toBeTruthy();
    expect(await findByText('Test draft 2')).toBeTruthy();
  });

  it('handles draft deletion', async () => {
    const { findByTestId } = render(<DraftsScreen />);
    
    const deleteButton = await findByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Draft',
      'Are you sure you want to delete this draft? This action cannot be undone.',
      expect.any(Array)
    );

    // Simulate confirming deletion
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((button: AlertButton) => button.text === 'Delete');
    confirmButton.onPress?.();

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'drafts',
        expect.stringContaining('Test draft 2')
      );
    });
  });

  it('handles draft editing navigation', async () => {
    const mockNavigation: Partial<NavigationProp<RootTabParamList>> = {
      navigate: jest.fn(),
    };
    
    const { findByTestId } = render(
      <DraftsScreen onClose={jest.fn()} onEditDraft={jest.fn()} />
    );

    const editButton = await findByTestId('edit-button-1');
    fireEvent.press(editButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Create', {
      draft: expect.objectContaining({
        id: '1',
        caption: 'Test draft 1',
      }),
    });
  });

  it('handles empty drafts state', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    const { findByText } = render(<DraftsScreen />);
    
    expect(await findByText('No drafts yet')).toBeTruthy();
  });

  it('handles error loading drafts', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    const { findByText } = render(<DraftsScreen />);
    
    expect(await findByText('Error loading drafts')).toBeTruthy();
  });
}); 