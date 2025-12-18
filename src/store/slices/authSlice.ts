// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Admin {
  id: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthState {
  admin: Admin | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  admin: null,
  csrfToken: null,
  isAuthenticated: false,
  isInitializing: true, // Start as true to prevent premature redirects
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ admin: Admin; csrfToken?: string }>) => {
      state.admin = action.payload.admin;
      state.csrfToken = action.payload.csrfToken || null;
      state.isAuthenticated = true;
      state.isInitializing = false;
      // No localStorage - auth is managed via httpOnly cookies
    },
    logout: (state) => {
      state.admin = null;
      state.csrfToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      // No localStorage to clear - cookies cleared by backend
    },
    restoreAuth: (state, action: PayloadAction<{ admin: Admin }>) => {
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    finishInitialization: (state) => {
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, logout, restoreAuth, finishInitialization } = authSlice.actions;
export default authSlice.reducer;
