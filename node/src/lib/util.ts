import {
  Liquidity,
  Market,
  //MarketV2,
  buildSimpleTransaction,
  findProgramAddress,
  SPL_ACCOUNT_LAYOUT,
  LIQUIDITY_STATE_LAYOUT_V4,
  MARKET_STATE_LAYOUT_V3,
  SPL_MINT_LAYOUT,
  InnerSimpleV0Transaction,
  ApiPoolInfoV4,
} from "@raydium-io/raydium-sdk";
import {
  Connection,
  PublicKey,
  SendOptions,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  myKeyPair,
  connection,
  makeTxVersion,
  addLookupTableInfo,
  PROGRAM_ID,
} from "../config";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

async function sendTx(connection, payer, txs, options) {
  const txids = [];
  for (const iTx of txs) {
    if (iTx instanceof VersionedTransaction) {
      iTx.sign([payer]);
      /* const simulationResult = await connection.simulateTransaction(iTx);
      console.log(
        "Simulation Result:",
        JSON.stringify(simulationResult, null, 2)
        //  iTx
      );
      */
      txids.push(await connection.sendTransaction(iTx, options));
    } else {
      /*const simulationResult = await connection.simulateTransaction(iTx);
      console.log(
        "Simulation Result:",
        JSON.stringify(simulationResult, null, 2)
      );
      */
      txids.push(await connection.sendTransaction(iTx, [payer], options));
    }
  }
  return txids;
}

async function getWalletTokenAccount(
  connection: Connection,
  pubKey: PublicKey
) {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(pubKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

async function buildAndSendTx(
  innerSimpleV0Transaction: InnerSimpleV0Transaction[],
  options?: SendOptions
) {
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: myKeyPair.publicKey,
    innerTransactions: innerSimpleV0Transaction,
    addLookupTableInfo: addLookupTableInfo,
  });

  return await sendTx(connection, myKeyPair, willSendTx, options);
}

function getATAAddress(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey
) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );
  return { publicKey, nonce };
}

async function sleepTime(ms) {
  // console.log((new Date()).toLocaleString(), 'sleepTime', ms)
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function formatAmmKeysById(id: string): Promise<ApiPoolInfoV4> {
  const account = await connection.getAccountInfo(new PublicKey(id));
  console.log("ACCOUNT", account, id);
  if (account === null) throw Error(" get id info error ");
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

  const marketId = info.marketId;
  const marketAccount = await connection.getAccountInfo(marketId);
  if (marketAccount === null) throw Error(" get market info error");
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);

  const lpMint = info.lpMint;
  const lpMintAccount = await connection.getAccountInfo(lpMint);
  if (lpMintAccount === null) throw Error(" get lp mint info error");
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data);

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: PROGRAM_ID.AmmV4.toString(), //account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({
      programId: account.owner,
    }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({
      programId: info.marketProgramId,
      marketId: info.marketId,
    }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: PublicKey.default.toString(),
  };
}
export {
  sendTx,
  getWalletTokenAccount,
  buildAndSendTx,
  getATAAddress,
  sleepTime,
  formatAmmKeysById,
  buildSimpleTransaction,
};
