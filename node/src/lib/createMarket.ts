import {
  MarketV2,
  MAINNET_PROGRAM_ID,
  DEVNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import { connection, makeTxVersion } from "../config";
import { buildAndSendTx } from "./util";

async function createMarket(input, mode) {
  const RAYDIUM_PROGRAM_ID =
    mode == "PROD" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

  // console.log(input, RAYDIUM_PROGRAM_ID);
  // -------- step 1: make instructions --------

  const createMarketInstruments =
    await MarketV2.makeCreateMarketInstructionSimple({
      connection,
      wallet: input.wallet.publicKey,
      baseInfo: input.baseToken,
      quoteInfo: input.quoteToken,
      lotSize: input.lotSize, // default 1
      tickSize: input.tickSize, // default 0.01
      dexProgramId: RAYDIUM_PROGRAM_ID.OPENBOOK_MARKET,
      makeTxVersion,
      requestQueueSpacce: input.requestQueueSpacce,
      eventQueueSpacce: input.eventQueueSpacce,
      orderbookQueueSpacce: input.orderbookQueueSpacce,
    });

  console.log(input);
  const marketId = createMarketInstruments.address.marketId;

  const txids = await buildAndSendTx(
    createMarketInstruments.innerTransactions,
    { skipPreflight: false }
  );
  console.log("Market Created");
  console.log("Create Market Transactions :", txids);
  console.log("Market Address :", marketId);

  /*return marketId;*/
  return "";
}

export { createMarket };
