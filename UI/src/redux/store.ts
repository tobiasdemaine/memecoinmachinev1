import { configureStore } from "@reduxjs/toolkit";
import { backofficeApi } from "./services/backofficeAPI";
import { tokenSlice } from "./tokenSlice";

export const store = configureStore({
  reducer: {
    //posts: postsReducer,
    //comments: commentsReducer,
    token: tokenSlice.reducer,
    [backofficeApi.reducerPath]: backofficeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backofficeApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
