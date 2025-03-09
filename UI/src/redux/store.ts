import { configureStore } from "@reduxjs/toolkit";
import { backofficeApi } from "./services/backofficeAPI";
import { tokenSlice } from "./tokenSlice";
import { accountSlice } from "./accountsSlice";

export const store = configureStore({
  reducer: {
    //posts: postsReducer,
    //comments: commentsReducer,
    token: tokenSlice.reducer,
    account: accountSlice.reducer,
    [backofficeApi.reducerPath]: backofficeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backofficeApi.middleware),
});

// Sync state to localStorage on every change
store.subscribe(() => {
  try {
    const state = store.getState().account;
    localStorage.setItem("accountState", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
