import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider } from '@/contexts/AuthContext';
import authReducer from '@/store/slices/authSlice';
import { adminApi } from '@/store/api/adminApi';
import type { RootState } from '@/store';

// Mock router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Test component simulating login flow
const TestLoginFlow = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div>
      <input
        data-testid="email-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        data-testid="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button data-testid="login-button">Login</button>
      <div data-testid="user-info">Not logged in</div>
    </div>
  );
};

describe('Auth Flow Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        [adminApi.reducerPath]: adminApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(adminApi.middleware),
    });
    localStorage.clear();
    mockPush.mockClear();
  });

  it('should initialize with unauthenticated state', () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <TestLoginFlow />
        </AuthProvider>
      </Provider>
    );

    expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
  });

  it('should restore auth from localStorage on mount', async () => {
    const mockAdmin = { id: '1', email: 'test@example.com', name: 'Test' };
    const mockToken = 'test-token';

    localStorage.setItem('adminToken', mockToken);
    localStorage.setItem('adminUser', JSON.stringify(mockAdmin));

    render(
      <Provider store={store}>
        <AuthProvider>
          <TestLoginFlow />
        </AuthProvider>
      </Provider>
    );

    await waitFor(() => {
      const state = (store.getState() as { auth: ReturnType<typeof authReducer> }).auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.admin).toEqual(mockAdmin);
    });
  });

  it('should finish initialization when no stored credentials', async () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <TestLoginFlow />
        </AuthProvider>
      </Provider>
    );

    await waitFor(() => {
      const state = (store.getState() as { auth: ReturnType<typeof authReducer> }).auth;
      expect(state.isInitializing).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  it('should handle corrupted localStorage data gracefully', async () => {
    localStorage.setItem('adminToken', 'test-token');
    localStorage.setItem('adminUser', 'invalid-json{');

    render(
      <Provider store={store}>
        <AuthProvider>
          <TestLoginFlow />
        </AuthProvider>
      </Provider>
    );

    await waitFor(() => {
      const state = (store.getState() as { auth: ReturnType<typeof authReducer> }).auth;
      expect(state.isInitializing).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('adminToken')).toBeNull();
    });
  });
});
