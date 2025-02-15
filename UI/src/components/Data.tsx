import { Box, Title } from "@mantine/core";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const Data = ({ token }: { token: any }) => {
  return (
    <>
      <Title mt={10} order={4}>
        MetaData
      </Title>
      <Box>Name: {token.data.metaData.name}</Box>
      <Box>Description: {token.data.metaData.description}</Box>
      <Box>Image: {token.data.metaData.image}</Box>
      <Box>Symbol: {token.data.metaData.symbol}</Box>
      <Box>
        URI:{" "}
        <a
          href={token.data.metaData.uri}
          target="_blank"
          rel="noopener noreferrer"
        >
          {token.data.metaData.uri}
        </a>
      </Box>
      <Title mt={10} order={4}>
        Token Data
      </Title>
      <Box>
        Add Base Amount Number: {token.data.tokenData.addBaseAmountNumber}
      </Box>
      <Box>
        Add Quote Amount Number: {token.data.tokenData.addQuoteAmountNumber}
      </Box>
      <Box>Decimals: {token.data.tokenData.decimals}</Box>
      <Box>Lot Size: {token.data.tokenData.lotSize}</Box>
      <Box>Metadata: {token.data.tokenData.metadata}</Box>
      <Box>Mint Account: {token.data.tokenData.mintAccount}</Box>
      <Box>Mint Authority: {token.data.tokenData.mintAuthority}</Box>
      <Box>Pool Lock Time: {token.data.tokenData.poolLockTime}</Box>
      <Box>Pool Mint Account: {token.data.tokenData.poolMintAccount}</Box>
      <Box>Target Market ID: {token.data.tokenData.targetMarketId}</Box>
      <Box>Tick Size: {token.data.tokenData.tickSize}</Box>
      <Box>Token Account: {token.data.tokenData.tokenAccount}</Box>

      <Title mt={10} order={4}>
        Pool Data
      </Title>
      <Box>Authority: {token.data.poolData.authority}</Box>
      <Box>Base Decimals: {token.data.poolData.baseDecimals}</Box>
      <Box>Base Mint: {token.data.poolData.baseMint}</Box>
      <Box>Base Vault: {token.data.poolData.baseVault}</Box>
      <Box>ID: {token.data.poolData.id}</Box>
      <Box>Lookup Table Account: {token.data.poolData.lookupTableAccount}</Box>
      <Box>LP Decimals: {token.data.poolData.lpDecimals}</Box>
      <Box>LP Mint: {token.data.poolData.lpMint}</Box>
      <Box>LP Vault: {token.data.poolData.lpVault}</Box>
      <Box>Market Asks: {token.data.poolData.marketAsks}</Box>
      <Box>Market Authority: {token.data.poolData.marketAuthority}</Box>
      <Box>Market Base Vault: {token.data.poolData.marketBaseVault}</Box>
      <Box>Market Bids: {token.data.poolData.marketBids}</Box>
      <Box>Market Event Queue: {token.data.poolData.marketEventQueue}</Box>
      <Box>Market ID: {token.data.poolData.marketId}</Box>
      <Box>Market Program ID: {token.data.poolData.marketProgramId}</Box>
      <Box>Market Quote Vault: {token.data.poolData.marketQuoteVault}</Box>
      <Box>Market Version: {token.data.poolData.marketVersion}</Box>
      <Box>Open Orders: {token.data.poolData.openOrders}</Box>
      <Box>Program ID: {token.data.poolData.programId}</Box>
      <Box>Quote Decimals: {token.data.poolData.quoteDecimals}</Box>
      <Box>Quote Mint: {token.data.poolData.quoteMint}</Box>
      <Box>Quote Vault: {token.data.poolData.quoteVault}</Box>
      <Box>Target Orders: {token.data.poolData.targetOrders}</Box>
      <Box>Version: {token.data.poolData.version}</Box>
      <Box>Withdraw Queue: {token.data.poolData.withdrawQueue}</Box>
    </>
  );
};
