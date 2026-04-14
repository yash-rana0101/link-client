import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  notificationPanelOpen: boolean;
  activeConversationId: string | null;
}

const initialState: UIState = {
  sidebarOpen: false,
  notificationPanelOpen: false,
  activeConversationId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationPanelOpen = action.payload;
    },
    setActiveConversationId: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  setActiveConversationId,
} = uiSlice.actions;

export default uiSlice.reducer;
