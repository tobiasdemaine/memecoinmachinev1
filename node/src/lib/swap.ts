/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  LIQUIDITY_STATE_LAYOUT_V4,
  LiquidityPoolKeys,
  //MAINNET_PROGRAM_ID,
  MARKET_STATE_LAYOUT_V3,
  LiquidityPoolInfo,
  TOKEN_PROGRAM_ID,
  WSOL,
  Liquidity,
  Percent,
  Token,
  TokenAmount,
} from "@raydium-io/raydium-sdk";
import fs from "fs";
import BN from "bn.js";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createSyncNativeInstruction,
  NATIVE_MINT,
} from "@solana/spl-token";
import { connection, PROGRAM_ID } from "../config";

export const getPoolKeys = async (ammId: string, connection: Connection) => {
  const ammAccount = await connection.getAccountInfo(new PublicKey(ammId));
  if (ammAccount) {
    const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(ammAccount.data);
    const marketAccount = await connection.getAccountInfo(poolState.marketId);
    if (marketAccount) {
      const marketState = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
      const marketAuthority = PublicKey.createProgramAddressSync(
        [
          marketState.ownAddress.toBuffer(),
          marketState.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
        ],
        PROGRAM_ID.OPENBOOK_MARKET
      );
      return {
        id: new PublicKey(ammId),
        programId: PROGRAM_ID.AmmV4,
        status: poolState.status,
        baseDecimals: poolState.baseDecimal.toNumber(),
        quoteDecimals: poolState.quoteDecimal.toNumber(),
        lpDecimals: 9,
        baseMint: poolState.baseMint,
        quoteMint: poolState.quoteMint,
        version: 4,
        authority: new PublicKey(
          "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
        ),
        openOrders: poolState.openOrders,
        baseVault: poolState.baseVault,
        quoteVault: poolState.quoteVault,
        marketProgramId: PROGRAM_ID.OPENBOOK_MARKET,
        marketId: marketState.ownAddress,
        marketBids: marketState.bids,
        marketAsks: marketState.asks,
        marketEventQueue: marketState.eventQueue,
        marketBaseVault: marketState.baseVault,
        marketQuoteVault: marketState.quoteVault,
        marketAuthority: marketAuthority,
        targetOrders: poolState.targetOrders,
        lpMint: poolState.lpMint,
      } as unknown as LiquidityPoolKeys;
    }
  }
};

const calculateAmountOut = async (
  poolKeys: LiquidityPoolKeys,
  poolInfo: LiquidityPoolInfo,
  tokenToBuy: string,
  amountIn: number,
  rawSlippage: number
) => {
  const tokenOutMint = new PublicKey(tokenToBuy);
  const tokenOutDecimals = poolKeys.baseMint.equals(tokenOutMint)
    ? poolInfo.baseDecimals
    : poolKeys.quoteDecimals;
  const tokenInMint = poolKeys.baseMint.equals(tokenOutMint)
    ? poolKeys.quoteMint
    : poolKeys.baseMint;
  const tokenInDecimals = poolKeys.baseMint.equals(tokenOutMint)
    ? poolInfo.quoteDecimals
    : poolInfo.baseDecimals;
  const tokenIn = new Token(TOKEN_PROGRAM_ID, tokenInMint, tokenInDecimals);
  const tknAmountIn = new TokenAmount(tokenIn, amountIn, false);
  const tokenOut = new Token(TOKEN_PROGRAM_ID, tokenOutMint, tokenOutDecimals);
  const slippage = new Percent(rawSlippage, 100);
  return {
    amountIn: tknAmountIn,
    tokenIn: tokenInMint,
    tokenOut: tokenOutMint,
    ...Liquidity.computeAmountOut({
      poolKeys,
      poolInfo,
      amountIn: tknAmountIn,
      currencyOut: tokenOut,
      slippage,
    }),
  };
};

const makeSwapInstruction = async (
  connection: Connection,
  tokenToBuy: string,
  rawAmountIn: number,
  slippage: number,
  poolKeys: LiquidityPoolKeys,
  poolInfo: LiquidityPoolInfo,
  keyPair: Keypair
) => {
  const { amountIn, tokenIn, tokenOut, minAmountOut } =
    await calculateAmountOut(
      poolKeys,
      poolInfo,
      tokenToBuy,
      rawAmountIn,
      slippage
    );
  let tokenInAccount: PublicKey;
  let tokenOutAccount: PublicKey;

  if (tokenIn.toString() == WSOL.mint) {
    tokenInAccount = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        keyPair,
        NATIVE_MINT,
        keyPair.publicKey
      )
    ).address;
    tokenOutAccount = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        keyPair,
        tokenOut,
        keyPair.publicKey
      )
    ).address;
  } else {
    tokenOutAccount = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        keyPair,
        NATIVE_MINT,
        keyPair.publicKey
      )
    ).address;
    tokenInAccount = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        keyPair,
        tokenIn,
        keyPair.publicKey
      )
    ).address;
  }

  const ix = new TransactionInstruction({
    programId: new PublicKey(poolKeys.programId),
    keys: [
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: poolKeys.id, isSigner: false, isWritable: true },
      { pubkey: poolKeys.authority, isSigner: false, isWritable: false },
      { pubkey: poolKeys.openOrders, isSigner: false, isWritable: true },
      { pubkey: poolKeys.baseVault, isSigner: false, isWritable: true },
      { pubkey: poolKeys.quoteVault, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketProgramId, isSigner: false, isWritable: false },
      { pubkey: poolKeys.marketId, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketBids, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketAsks, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketEventQueue, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketBaseVault, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketQuoteVault, isSigner: false, isWritable: true },
      { pubkey: poolKeys.marketAuthority, isSigner: false, isWritable: false },
      { pubkey: tokenInAccount, isSigner: false, isWritable: true },
      { pubkey: tokenOutAccount, isSigner: false, isWritable: true },
      { pubkey: keyPair.publicKey, isSigner: true, isWritable: false },
    ],
    data: Buffer.from(
      Uint8Array.of(
        9,
        ...new BN(amountIn.raw).toArray("le", 8),
        ...new BN(minAmountOut.raw).toArray("le", 8)
      )
    ),
  });
  return {
    swapIX: ix,
    tokenInAccount: tokenInAccount,
    tokenOutAccount: tokenOutAccount,
    tokenIn,
    tokenOut,
    amountIn,
    minAmountOut,
  };
};

export const executeTransaction = async (
  swapAmountIn: number,
  tokenToBuy: string,
  ammId: string,
  keyPairString: string
) => {
  const secretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(keyPairString) as unknown as string)
  );
  const keyPair = Keypair.fromSecretKey(secretKey);
  //const ammId = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2"; // Address of the SOL-USDC pool on mainnet
  const slippage = 2; // 2% slippage tolerance

  const poolKeys = await getPoolKeys(ammId, connection);
  if (poolKeys) {
    const poolInfo = Liquidity.getAssociatedPoolKeys({
      version: 4,
      marketVersion: 3,
      baseMint: poolKeys.baseMint,
      quoteMint: poolKeys.quoteMint,
      baseDecimals: poolKeys.baseDecimals,
      quoteDecimals: poolKeys.quoteDecimals,
      marketId: poolKeys.marketId,
      programId: poolKeys.programId,
      marketProgramId: poolKeys.marketProgramId,
    });
    const txn = new Transaction();
    //  await Liquidity.makeSwapInstructionSimple({});
    const { swapIX, tokenInAccount, tokenIn, amountIn } =
      await makeSwapInstruction(
        connection,
        tokenToBuy,
        swapAmountIn,
        slippage,
        poolKeys,
        //@ts-ignore
        poolInfo,
        keyPair
      );
    console.log("XXXX");
    if (tokenIn.toString() == WSOL.mint) {
      // Convert SOL to Wrapped SOL
      txn.add(
        SystemProgram.transfer({
          fromPubkey: keyPair.publicKey,
          toPubkey: tokenInAccount,
          lamports: amountIn.raw.toNumber(),
        }),
        createSyncNativeInstruction(tokenInAccount, TOKEN_PROGRAM_ID)
      );
    }
    txn.add(swapIX);
    const hash = await sendAndConfirmTransaction(connection, txn, [keyPair], {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    console.log("Transaction Completed Successfully 🎉🚀.");
    console.log(`Explorer URL: https://solscan.io/tx/${hash}`);
  } else {
    console.log(`Could not get PoolKeys for AMM: ${ammId}`);
  }
};

// // Convert 0.01 SOL to USDC

// Convert 1 USDC to SOL
// executeTransaction(
//     1,
//     WSOL.mint // WSOL Address
// )
