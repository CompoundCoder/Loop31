import '@testing-library/jest-native/extend-expect';

// Add custom matchers
expect.extend({
  toHaveStyle(received, style) {
    const pass = received.props.style.includes(style);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to have style ${style}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to have style ${style}`,
        pass: false,
      };
    }
  },
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 