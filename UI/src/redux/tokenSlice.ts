/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Define a type for the slice state

// Define the initial state using that type
const initialState = {
  mode: "DEV",
  symbol: "",
  data: {} as any,
};

export const tokenSlice = createSlice({
  name: "token",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setToken: (state, action: PayloadAction<any>) => {
      state.mode = action.payload.mode;
      state.symbol = action.payload.symbol;
      state.data = action.payload.data;
    },
  },
});

export const { setToken } = tokenSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectToken = (state: RootState) => state.token;

export default tokenSlice.reducer;
