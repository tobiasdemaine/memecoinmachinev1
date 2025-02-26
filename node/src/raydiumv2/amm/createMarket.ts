import {
  OPEN_BOOK_PROGRAM,
  DEVNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk-v2";
import { initSdk, txVersion, config, configPath } from "../config";
import { PublicKey } from "@solana/web3.js";
import fs from "fs";
export const createMarket = async () => {
  const raydium = await initSdk();

  // check mint info here: https://api-v3.raydium.io/mint/list
  // or get mint info by api: await raydium.token.getTokenInfo('mint address')
  const market = {
    baseInfo: {
      mint: new PublicKey(config.tokenData.mintAccount),
      decimals: config.tokenData.decimals,
    },
    quoteInfo: {
      mint: new PublicKey("So11111111111111111111111111111111111111112"),
      decimals: 9,
    },
    lotSize: config.tokenData.lotSize,
    tickSize: config.tokenData.tickSize,
    dexProgramId:
      config.mode === "PROD"
        ? OPEN_BOOK_PROGRAM
        : DEVNET_PROGRAM_ID.OPENBOOK_MARKET,

    requestQueueSpace: config.tokenData.requestQueueSpacce, // optional
    eventQueueSpace: config.tokenData.eventQueueSpacce, // optional
    orderbookQueueSpace: config.tokenData.orderbookQueueSpacce, // optional
    txVersion,
    lowestFeeMarket: true,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  };
  console.log(market);
  const { execute, extInfo, transactions } = await raydium.marketV2.create(
    market
  );

  const data = Object.keys(extInfo.address).reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
    }),
    {}
  );

  console.log(
    `create market total ${transactions.length} txs, market info: `,
    data
  );

  const txIds = await execute({
    // set sequentially to true means tx will be sent when previous one confirmed
    sequentially: true,
    skipPreflight: true,
  });

  console.log("create market txIds:", txIds);

  config.tokenData.targetMarketId = data["marketId"];

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("Config file updated with targetPool.");
};

/** uncomment code below to execute */
createMarket();
