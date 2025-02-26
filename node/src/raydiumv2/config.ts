import {
  Raydium,
  TxVersion,
  parseTokenAccountResp,
} from "@raydium-io/raydium-sdk-v2";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";

export const configPath = process.argv[2];
export const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const connection = new Connection(
  config.mode == "PROD" ? config.RPC_MAIN : config.RPC_DEV
); // helius
//const PROGRAM_ID =
// config.mode == "PROD" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;
const kname = config.mode + "_" + config.metaData.symbol;
const POOL_WALLET_SECRET = JSON.parse(
  fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
);

export const owner: Keypair = Keypair.fromSecretKey(
  new Uint8Array(POOL_WALLET_SECRET)
);
//export const connection = new Connection('<YOUR_RPC_URL>') //<YOUR_RPC_URL>
// export const connection = new Connection(clusterApiUrl('devnet')) //<YOUR_RPC_URL>
export const txVersion = TxVersion.V0; // or TxVersion.LEGACY
const cluster = config.mode == "PROD" ? "mainnet" : "devnet";

let raydium: Raydium | undefined;
export const initSdk = async (params?: { loadToken?: boolean }) => {
  if (raydium) return raydium;
  if (connection.rpcEndpoint === clusterApiUrl("mainnet-beta"))
    console.warn(
      "using free rpc node might cause unexpected error, strongly suggest uses paid rpc node"
    );
  console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`);
  raydium = await Raydium.load({
    owner,
    connection,
    cluster,
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: "finalized",
    // urlConfigs: {
    //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
    // },
  });

  /**
   * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
   * if you want to handle token account by yourself, set token account data after init sdk
   * code below shows how to do it.
   * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
   */

  /*  
  raydium.account.updateTokenAccount(await fetchTokenAccountData())
  connection.onAccountChange(owner.publicKey, async () => {
    raydium!.account.updateTokenAccount(await fetchTokenAccountData())
  })
  */

  return raydium;
};

export const fetchTokenAccountData = async () => {
  const solAccountResp = await connection.getAccountInfo(owner.publicKey);
  const tokenAccountResp = await connection.getTokenAccountsByOwner(
    owner.publicKey,
    { programId: TOKEN_PROGRAM_ID }
  );
  const token2022Req = await connection.getTokenAccountsByOwner(
    owner.publicKey,
    { programId: TOKEN_2022_PROGRAM_ID }
  );
  const tokenAccountData = parseTokenAccountResp({
    owner: owner.publicKey,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  });
  return tokenAccountData;
};

export const grpcUrl = "<YOUR_GRPC_URL>";
export const grpcToken = "<YOUR_GRPC_TOKEN>";
