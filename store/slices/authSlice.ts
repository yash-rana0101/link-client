import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearSession: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.hydrated = true;
    },
    setHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const { setSession, updateAccessToken, clearSession, setHydrated } =
  authSlice.actions;

export default authSlice.reducer;
