/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Define a type for the slice state
interface Account {
  account: string;
  tokentMint?: string;
  tokenAccount?: string;
  sol: number;
  token: number;
  secret?: string | null;
}
// Define the initial state using that type
const initialState: { accounts: Account[] } = {
  accounts: [],
};

export const accountSlice = createSlice({
  name: "account",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setAccount: (state, action: PayloadAction<any>) => {
      const idx = state.accounts.findIndex(
        (account) => account.account == action.payload.address
      );
      if (idx) {
        state.accounts[idx] = action.payload;
      } else {
        state.accounts.push(action.payload);
      }
    },
  },
});

export const { setAccount } = accountSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectAccounts = (state: RootState) => state.account;

export default accountSlice.reducer;
