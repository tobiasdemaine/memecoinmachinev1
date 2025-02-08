import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import {
  Currency,
  Token,
  TxVersion,
  TOKEN_PROGRAM_ID,
  LOOKUP_TABLE_CACHE,
} from "@raydium-io/raydium-sdk";

const makeTxVersion = TxVersion.V0;
const configPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const connection = new Connection(
  config.mode == "PROD" ? config.RPC_MAIN : config.RPC_DEV
); // helius

const kname = config.mode + "_" + config.metaData.symbol;
const POOL_WALLET_SECRET = JSON.parse(
  fs.readFileSync("../tokens/keys/" + kname + "-keypair.json", "utf8")
);

const myKeyPair = Keypair.fromSecretKey(new Uint8Array(POOL_WALLET_SECRET));

const addLookupTableInfo =
  config.mode == "PROD" ? LOOKUP_TABLE_CACHE : undefined;

const CONFIG_MAINNET_PROGRAM_ID = {
  AMM_OWNER: new PublicKey("GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ"),
  CREATE_POOL_FEE_ADDRESS: new PublicKey(
    "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"
  ),
};

const CONFIG_DEVNET_PROGRAM_ID = {
  AMM_OWNER: new PublicKey("Adm29NctkKwJGaaiU8CXqdV6WDTwR81JbxV8zoxn745Y"),
  CREATE_POOL_FEE_ADDRESS: new PublicKey(
    "3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"
  ),
};

const CONFIG_PROGRAM_ID =
  config.mode == "PROD" ? CONFIG_MAINNET_PROGRAM_ID : CONFIG_DEVNET_PROGRAM_ID;

const DEFAULT_TOKEN = {
  SOL: new Currency(9, "USDC", "USDC"),
  WSOL: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("So11111111111111111111111111111111111111112"),
    9,
    "WSOL",
    "WSOL"
  ),
  KSPR: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("4KQ2vqoAMwvo9qDtpxLdcURBuDkW1DVxcHgoxpEJNGDV"),
    6,
    "KSPR",
    "KSPR"
  ),
  PLLE: new Token(
    TOKEN_PROGRAM_ID,
    new PublicKey("BHEJ7icZwFFDkDssoeULp288DNHkPAJwf4PZCMmRMkRk"),
    6,
    "PLLE",
    "PLLE"
  ),
};

export {
  connection,
  myKeyPair,
  makeTxVersion,
  addLookupTableInfo,
  CONFIG_PROGRAM_ID,
  DEFAULT_TOKEN,
};
