/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from "fs";
import { IDL, type OpenbookV2 } from "@openbook-dex/openbook-v2";

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Program, Provider, getProvider } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Currency, Token } from "@raydium-io/raydium-sdk";

const configPath = process.argv[2];
export const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const kname = config.mode + "_" + config.metaData.symbol;
const authorityFile = "../tokens/keys/" + kname + "-keypair.json";

// export const RPC = "http://127.0.0.1:8899";
// export const RPC = "https://api.devnet.solana.com";
// export const RPC= "https://api.testnet.solana.com";
export const RPC = config.mode == "PROD" ? config.RPC_MAIN : config.RPC_DEV; //"https://api.mainnet-beta.solana.com";

export const programId = new PublicKey(
  "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"
);

export const authority = getKeypairFromFile(authorityFile);
export const connection = new Connection(RPC, {
  commitment: "finalized",
  confirmTransactionInitialTimeout: 30000,
});

console.log(programId);
//@ts-ignore
export const program = new Program<OpenbookV2>(IDL, programId, {} as Provider);

export function getKeypairFromFile(filePath: string): Keypair {
  return Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        process.env.KEYPAIR || fs.readFileSync(filePath.toString(), "utf-8")
      )
    )
  );
}

export const DEFAULT_TOKEN = {
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
