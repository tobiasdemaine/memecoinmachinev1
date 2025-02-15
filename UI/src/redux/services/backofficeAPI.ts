/* eslint-disable @typescript-eslint/no-explicit-any */
// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
//import type { RootState } from '../store';
// Define a service using a base URL and expected endpoints
export const backofficeApi = createApi({
  reducerPath: "backofficeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://127.0.0.1:5000/`,
    /* prepareHeaders: (headers, { getState }) => {
     const { accessToken } = (getState() as RootState).user;
      if (accessToken) {
        headers.set('x-access-token', accessToken);
      }
      return headers;
    },*/
  }),
  tagTypes: ["token"],
  endpoints: (builder) => ({
    watch: builder.mutation<any, any>({
      query: (body) => ({
        url: "/watch",
        method: "POST",
        body,
      }),
    }),
    tokens: builder.query<any, void>({
      query: () => ({
        url: "/list",
        method: "GET",
      }),
    }),
    switchToken: builder.mutation<any, any>({
      query: (body) => ({
        url: "/switchToken",
        method: "POST",
        body,
      }),
    }),
    audit: builder.mutation<any, any>({
      query: (body) => ({
        url: "/audit",
        method: "POST",
        body,
      }),
    }),
    TradingAccounts: builder.mutation<any, any>({
      query: (body) => ({
        url: "/walletholdings",
        method: "POST",
        body,
      }),
    }),
    withdrawLiquidity: builder.mutation<any, any>({
      query: (body) => ({
        url: "/withdrawliquidity",
        method: "POST",
        body,
      }),
    }),
    withdrawFromAllAccounts: builder.mutation<any, any>({
      query: (body) => ({
        url: "/etallsolfromwallets",
        method: "POST",
        body,
      }),
    }),
    sellAllTokens: builder.mutation<any, any>({
      query: (body) => ({
        url: "/sellalltokens",
        method: "POST",
        body,
      }),
    }),
    tranferSoltoMaster: builder.mutation<any, any>({
      query: (body) => ({
        url: "/tranferfromtokentomaster",
        method: "POST",
        body,
      }),
    }),
    masterWalletBalance: builder.mutation<any, any>({
      query: (body) => ({
        url: "/masterwalletholdings",
        method: "POST",
        body,
      }),
    }),
    tokenWalletBalance: builder.mutation<any, any>({
      query: (body) => ({
        url: "/tokenwalletholdings",
        method: "POST",
        body,
      }),
    }),
    masterWalletSpend: builder.mutation<any, any>({
      query: (body) => ({
        url: "/masterwalletspend",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useWatchMutation,
  useTokensQuery,
  useSwitchTokenMutation,
  useAuditMutation,
  useTradingAccountsMutation,
  useWithdrawLiquidityMutation,
  useSellAllTokensMutation,
  useWithdrawFromAllAccountsMutation,
  useTranferSoltoMasterMutation,
  useTokenWalletBalanceMutation,
  useMasterWalletBalanceMutation,
  useMasterWalletSpendMutation,
} = backofficeApi;
