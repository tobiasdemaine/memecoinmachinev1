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
  tagTypes: ["tokens"],
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
        providesTags: ["tokens"],
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
        url: "/getallsolfromwallets",
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
    regenerateSite: builder.mutation<any, any>({
      query: (body) => ({
        url: "/regeneratesite",
        method: "POST",
        body,
      }),
    }),
    republishSite: builder.mutation<any, any>({
      query: (body) => ({
        url: "/republishsite",
        method: "POST",
        body,
      }),
    }),
    saveJson: builder.mutation<any, any>({
      query: (body) => ({
        url: "/tokenwebsitejsonsave",
        method: "POST",
        body,
      }),
    }),
    status: builder.mutation<any, any>({
      query: (body) => ({
        url: "/status",
        method: "POST",
        body,
      }),
    }),
    newTokenStep1: builder.mutation<any, any>({
      query: (body) => ({
        url: "/newTokenStep1",
        method: "POST",
        body,
      }),
    }),
    newTokenStep2: builder.mutation<any, any>({
      query: (body) => ({
        url: "/newTokenStep2",
        method: "POST",
        body,
      }),
    }),
    tradeSwap: builder.mutation<any, any>({
      query: (body) => ({
        url: "/swapall",
        method: "POST",
        body,
      }),
    }),
    tradeSwapSome: builder.mutation<any, any>({
      query: (body) => ({
        url: "/swapsome",
        method: "POST",
        body,
      }),
    }),
    getBalance: builder.mutation<any, any>({
      query: (body) => ({
        url: "/getbalance",
        method: "POST",
        body,
      }),
    }),
    moveTokensToWallet: builder.mutation<any, any>({
      query: (body) => ({
        url: "/movetokenstowallet",
        method: "POST",
        body,
      }),
    }),
    moveSolToWallet: builder.mutation<any, any>({
      query: (body) => ({
        url: "/movetokenstowallet",
        method: "POST",
        body,
      }),
    }),
    //,
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
  useRegenerateSiteMutation,
  useRepublishSiteMutation,
  useSaveJsonMutation,
  useNewTokenStep1Mutation,
  useNewTokenStep2Mutation,
  useStatusMutation,
  useTradeSwapMutation,
  useTradeSwapSomeMutation,
  useGetBalanceMutation,
  useMoveSolToWalletMutation,
  useMoveTokensToWalletMutation,
} = backofficeApi;
