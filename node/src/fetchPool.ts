/* eslint-disable @typescript-eslint/no-explicit-any */
import { PROGRAM_ID } from "./config";
import { formatAmmKeys } from "./lib/formatAMMkeys";
import * as fs from "fs";

type TestTxInputInfo = {
  marketId: string;
};
const configFilePath = process.argv[2];
if (!configFilePath) {
  throw new Error("Config file path must be provided as a runtime argument.");
}
const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

export async function ammFetchPoolId(input: TestTxInputInfo): Promise<any> {
  if (!config.poolData) {
    console.log("This can take some time");
    const data = await formatAmmKeys(PROGRAM_ID.AmmV4.toString());
    const requirePoolData = data.filter(
      (item) => item.marketId === input.marketId
    );
    config.poolData = requirePoolData[0];
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf8");
  }

  return config.poolData;
}

/*const marketId = config.tokenData.targetMarketId;
ammFetchPoolId({
  marketId,
}).then((requirePoolData) => {
   console.log("Target Pool Id", requirePoolData[0].id);
});*/
