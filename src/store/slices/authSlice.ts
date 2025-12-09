// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  admin: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ admin: Admin; token: string }>) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem('adminToken', action.payload.token);
      localStorage.setItem('adminUser', JSON.stringify(action.payload.admin));
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    },
    restoreAuth: (state, action: PayloadAction<{ admin: Admin; token: string }>) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
