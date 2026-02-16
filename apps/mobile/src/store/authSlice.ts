/**
 * authSlice.ts — Stores JWT tokens and authenticated user data.
 * Persisted to AsyncStorage via redux-persist (add in production).
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token:        string | null;
  refreshToken: string | null;
  user:         Record<string, unknown> | null;
}

const initialState: AuthState = { token: null, refreshToken: null, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>) => {
      state.token        = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user         = action.payload.user;
    },
    clearCredentials: (state) => {
      state.token = null; state.refreshToken = null; state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
