import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  role: string | null;
  username: string | null;
  user: string | null;
  isAuthenticated: boolean;
}

interface LoginPayload {
  email: string;
  username: string;
  role : string
}

const initialState: AuthState = {
  role: null,
  username: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      state.role = action.payload.role; // Store email or any identifier you need
      state.user = action.payload.email; // Store email or any identifier you need
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.username = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
