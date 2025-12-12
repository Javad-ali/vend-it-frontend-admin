import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, logout, restoreAuth, finishInitialization } from '@/store/slices/authSlice';

type AuthState = ReturnType<typeof authReducer>;
type TestStore = ReturnType<typeof configureStore<{ auth: AuthState }>>;

describe('authSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      
      expect(state.admin).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitializing).toBe(true);
    });
  });

  describe('setCredentials', () => {
    it('should set admin and token when credentials are provided', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      const token = 'test-token';

      store.dispatch(setCredentials({ admin, token }));
      const state = store.getState().auth;

      expect(state.admin).toEqual(admin);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitializing).toBe(false);
    });

    it('should persist credentials to localStorage', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      const token = 'test-token';

      store.dispatch(setCredentials({ admin, token }));

      expect(localStorage.getItem('adminToken')).toBe(token);
      expect(localStorage.getItem('adminUser')).toBe(JSON.stringify(admin));
    });
  });

  describe('logout', () => {
    it('should clear admin and token', () => {
      // First set credentials
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      store.dispatch(setCredentials({ admin, token: 'test-token' }));

      // Then logout
      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state.admin).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitializing).toBe(false);
    });

    it('should clear localStorage', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      store.dispatch(setCredentials({ admin, token: 'test-token' }));
      
      store.dispatch(logout());

      expect(localStorage.getItem('adminToken')).toBeNull();
      expect(localStorage.getItem('adminUser')).toBeNull();
    });
  });

  describe('restoreAuth', () => {
    it('should restore admin and token from storage', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      const token = 'restored-token';

      store.dispatch(restoreAuth({ admin, token }));
      const state = store.getState().auth;

      expect(state.admin).toEqual(admin);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitializing).toBe(false);
    });

    it('should not persist to localStorage (already persisted)', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      const token = 'restored-token';

      localStorage.clear();
      store.dispatch(restoreAuth({ admin, token }));

      // restoreAuth should not write to localStorage
      expect(localStorage.getItem('adminToken')).toBeNull();
      expect(localStorage.getItem('adminUser')).toBeNull();
    });
  });

  describe('finishInitialization', () => {
    it('should set isInitializing to false', () => {
      store.dispatch(finishInitialization());
      const state = store.getState().auth;

      expect(state.isInitializing).toBe(false);
    });

    it('should not change other state', () => {
      const initialState = store.getState().auth;
      
      store.dispatch(finishInitialization());
      const state = store.getState().auth;

      expect(state.admin).toBe(initialState.admin);
      expect(state.token).toBe(initialState.token);
      expect(state.isAuthenticated).toBe(initialState.isAuthenticated);
    });
  });

  describe('complex scenarios', () => {
    it('should handle login -> logout -> restore flow', () => {
      const admin = { id: '1', email: 'test@example.com', name: 'Test User' };
      const token = 'test-token';

      // Login
      store.dispatch(setCredentials({ admin, token }));
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Logout
      store.dispatch(logout());
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // Restore (simulate page refresh)
      store.dispatch(restoreAuth({ admin, token }));
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.admin).toEqual(admin);
    });
  });
});
