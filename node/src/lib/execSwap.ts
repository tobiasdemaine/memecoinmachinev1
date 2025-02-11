/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Liquidity,
  TokenAmount,
  jsonInfo2PoolKeys,
  buildSimpleTransaction,
} from "@raydium-io/raydium-sdk";

import { VersionedTransaction } from "@solana/web3.js";

//import bs58 from "bs58";

import { connection, makeTxVersion, addLookupTableInfo } from "../config";

import { getWalletTokenAccount, formatAmmKeysById, sleepTime } from "./util";

async function execSwap(input) {
  const myKeyPair = input.wallet;
  const myPublicKey = myKeyPair.publicKey;

  // -------- pre-action: get pool info --------
  // const targetPoolInfo = await formatAmmKeysById(input.targetPool)
  let targetPoolInfo;
  while (true) {
    try {
      targetPoolInfo = await formatAmmKeysById(input.targetPool);
      if (targetPoolInfo) {
        break; // If successful, exit the loop
      }
    } catch {
      console.error("pool not found, retrying...");
    }
    await sleepTime(1000); // Wait for 1 seconds before retrying
  }
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo);

  // -------- step 1: coumpute amount out --------
  // const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
  //     poolKeys: poolKeys,
  //     poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
  //     amountIn: input.inputTokenAmount,
  //     currencyOut: input.outputToken,
  //     slippage: input.slippage,
  // })

  // hard_coded
  const minAmountOut = new TokenAmount(input.outputToken, 1);

  const walletTokenAccounts = await getWalletTokenAccount(
    connection,
    myPublicKey
  );

  const instruction = await Liquidity.makeSwapInstructionSimple({
    connection,
    //@ts-ignore
    poolKeys,
    userKeys: {
      tokenAccounts: walletTokenAccounts,
      owner: myPublicKey,
    },
    amountIn: input.inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: "in",
    makeTxVersion,
  });
  const { innerTransactions } = instruction;

  // const txids = await buildAndSendTx(innerTransactions, { skipPreflight: true })
  // console.log("txids", txids)

  // return txids
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: myPublicKey,
    innerTransactions,
    addLookupTableInfo: addLookupTableInfo,
  });

  const txids = [];
  for (const iTx of willSendTx) {
    if (iTx instanceof VersionedTransaction) {
      iTx.sign([myKeyPair]);
      txids.push(
        await connection.sendTransaction(iTx, { skipPreflight: true })
      );
    } else {
      txids.push(
        await connection.sendTransaction(iTx, [myKeyPair], {
          skipPreflight: true,
        })
      );
    }
  }
  console.log("swapped for ", myPublicKey);
  console.log("txids : ", txids);
  // return txids;
}

// function getMarketAssociatedPoolKeys(input) {
//     return Liquidity.getAssociatedPoolKeys({
//         version: 4,
//         marketVersion: 3,
//         baseMint: input.baseToken,
//         quoteMint: input.quoteToken,
//         baseDecimals: input.baseToken.decimals,
//         quoteDecimals: input.quoteToken.decimals,
//         marketId: input.targetMarketId,
//         programId: input.programId,
//         marketProgramId: input.marketProgramId,
//     })
// }

export { execSwap };
