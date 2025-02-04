import {
  Liquidity,
  MAINNET_PROGRAM_ID,
  DEVNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import BN from "bn.js";

import {
  connection,
  makeTxVersion,
  CONFIG_PROGRAM_ID,
  myKeyPair,
} from "../config.js";
import { buildAndSendTx } from "./util.js";

async function createPool(params, mode) {
  const RAYDIUM_PROGRAM_ID =
    mode == "PROD" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

  const myPublicKey = myKeyPair.publicKey;

  /* do something with start price if needed */
  // const startPrice = calcMarketStartPrice({ addBaseAmount: params.addBaseAmount, addQuoteAmount: params.addQuoteAmount })
  // console.log("START PRICE")
  // console.log(startPrice)

  /* do something with market associated pool keys if needed */
  // const associatedPoolKeys = getMarketAssociatedPoolKeys({
  //     baseToken: params.baseToken,
  //     quoteToken: params.quoteToken,
  //     targetMarketId: params.targetMarketId,
  //     programId: RAYDIUM_PROGRAM_ID.AmmV4,
  //     marketProgramId: RAYDIUM_PROGRAM_ID.OPENBOOK_MARKET,
  // })
  // const poolId = associatedPoolKeys.id

  const initPoolInstructionResponse =
    await Liquidity.makeCreatePoolV4InstructionV2Simple({
      connection: connection,
      programId: RAYDIUM_PROGRAM_ID.AmmV4,
      // programId: CONFIG_PROGRAM_ID.AMM_OWNER,
      marketInfo: {
        marketId: params.targetMarketId,
        programId: RAYDIUM_PROGRAM_ID.OPENBOOK_MARKET,
      },
      baseMintInfo: params.baseToken,
      quoteMintInfo: params.quoteToken,
      baseAmount: params.addBaseAmount,
      quoteAmount: params.addQuoteAmount,
      startTime: new BN(Math.floor(params.startTime)),
      ownerInfo: {
        feePayer: myPublicKey,
        wallet: myPublicKey,
        tokenAccounts: params.walletTokenAccounts,
        useSOLBalance: true, // if has WSOL mint
      },
      associatedOnly: false,
      // computeBudgetConfig?,
      checkCreateATAOwner: true,
      makeTxVersion: makeTxVersion,
      // lookupTableCache?,
      feeDestinationId: CONFIG_PROGRAM_ID.CREATE_POOL_FEE_ADDRESS,
    });

  const poolId = initPoolInstructionResponse.address.ammId;

  const { innerTransactions } = initPoolInstructionResponse;

  const txids = await buildAndSendTx(innerTransactions, {
    skipPreflight: true,
  });
  console.log("Pool Created");
  console.log("Pool Create Tranasactions :", txids);
  console.log("Pool Address :", poolId);

  return poolId;
}

function calcMarketStartPrice(input) {
  return (
    input.addBaseAmount.toNumber() /
    10 ** 6 /
    (input.addQuoteAmount.toNumber() / 10 ** 6)
  );
}

function getMarketAssociatedPoolKeys(input) {
  return Liquidity.getAssociatedPoolKeys({
    version: 4,
    marketVersion: 3,
    baseMint: input.baseToken,
    quoteMint: input.quoteToken,
    baseDecimals: input.baseToken.decimals,
    quoteDecimals: input.quoteToken.decimals,
    marketId: input.targetMarketId,
    programId: input.programId,
    marketProgramId: input.marketProgramId,
  });
}

export { createPool, calcMarketStartPrice, getMarketAssociatedPoolKeys };
