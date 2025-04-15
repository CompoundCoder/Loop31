import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PostCard from '../../components/PostCard';

describe('PostCard', () => {
  const mockProps = {
    mediaUri: 'https://example.com/image.jpg',
    caption: 'Test caption',
    platforms: [
      { id: 'ig1', type: 'instagram' as const, name: 'Test Instagram' },
      { id: 'fb1', type: 'facebook' as const, name: 'Test Facebook' },
    ],
    date: new Date('2024-04-14T12:00:00Z'),
    status: 'draft' as const,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onSchedule: jest.fn(),
  };

  it('renders correctly with all props', () => {
    const { getByText, getByTestId } = render(<PostCard {...mockProps} />);
    
    // Check if caption is rendered
    expect(getByText('Test caption')).toBeTruthy();
    
    // Check if platforms are rendered
    mockProps.platforms.forEach(platform => {
      expect(getByText(platform.name)).toBeTruthy();
    });
    
    // Check if date is rendered in correct format
    expect(getByText('Apr 14, 2024')).toBeTruthy();
  });

  it('calls onEdit when edit button is pressed', () => {
    const { getByTestId } = render(<PostCard {...mockProps} />);
    
    fireEvent.press(getByTestId('edit-button'));
    expect(mockProps.onEdit).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByTestId } = render(<PostCard {...mockProps} />);
    
    fireEvent.press(getByTestId('delete-button'));
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('calls onSchedule when schedule button is pressed', () => {
    const { getByTestId } = render(<PostCard {...mockProps} />);
    
    fireEvent.press(getByTestId('schedule-button'));
    expect(mockProps.onSchedule).toHaveBeenCalled();
  });

  it('renders different actions based on status', () => {
    const scheduledProps = {
      ...mockProps,
      status: 'scheduled' as const,
    };

    const { queryByTestId } = render(<PostCard {...scheduledProps} />);
    
    // Schedule button should not be present for scheduled posts
    expect(queryByTestId('schedule-button')).toBeNull();
  });
}); 