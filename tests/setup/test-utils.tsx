// Simplified test utilities - just re-export React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Simple mock store for testing
export const mockStore = {
  getState: () => ({}),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
};
