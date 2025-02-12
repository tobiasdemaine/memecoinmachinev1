import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";

import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
import {
  DEFAULT_TOKEN,
  RPC,
  authority,
  config,
  connection,
  programId,
} from "./lib/obUtils";
//import { MintUtils } from "./mint_utils";

export async function createAccount(
  connection: Connection,
  authority: Keypair,
  size: number,
  owner: PublicKey
): Promise<PublicKey> {
  const lamports = await connection.getMinimumBalanceForRentExemption(size);
  const address = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: authority.publicKey,
      newAccountPubkey: address.publicKey,
      lamports,
      space: size,
      programId: owner,
    })
  );

  transaction.feePayer = authority.publicKey;
  const hash = await connection.getRecentBlockhash();
  transaction.recentBlockhash = hash.blockhash;
  // Sign transaction, broadcast, and confirm
  await sendAndConfirmTransaction(
    connection,
    transaction,
    [authority, address],
    { commitment: "confirmed" }
  );
  return address.publicKey;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(new Connection(RPC), wallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider, programId);

  console.log(
    "starting with balance: ",
    await provider.connection.getBalance(authority.publicKey)
  );

  // const nbMints = 2;
  //let mintUtils = new MintUtils(provider.connection, authority);
  // let mints = await mintUtils.createMints(nbMints);
  // console.log("Mints created");
  // console.log("Mint 0", mints[0].toString());
  // console.log("Mint 1", mints[1].toString());
  // await delay(300);
  // const baseMint = mints[1];
  // const quoteMint = mints[0];

  // In devent
  // const baseMint = new PublicKey("DEPipWZkmZcr1sL6pVwj8amRjr9kw91UkFR7tvqdvMy2");
  // const quoteMint = new PublicKey("BfvE9DViu6SkSMBz4TYVftd5DNp7bafemMujXBdVwFYN");

  // Mainnet acounts for SOL-USDC
  // WSOL
  const baseMint = new PublicKey(config.tokenData.mintAccount);
  // USDC
  const quoteMint = DEFAULT_TOKEN.WSOL.programId;

  // // Sol/USD
  // const oracleAId = new PublicKey(
  //   "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"
  // );
  // // USDC/USD
  // const oracleBId = new PublicKey(
  //   "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
  // );
  const oracleAId = null;
  const oracleBId = null;

  // let [oracleAId, _tmp1] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from("StubOracle"),
  //     adminKp.publicKey.toBytes(),
  //     baseMint.toBytes(),
  //   ],
  //   programId
  // );

  // let [oracleBId, _tmp3] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from("StubOracle"),
  //     adminKp.publicKey.toBytes(),
  //     quoteMint.toBytes(),
  //   ],
  //   programId
  // );

  // let price = getRandomInt(1000);

  // if ((await anchorProvider.connection.getAccountInfo(oracleAId)) == null) {
  //   await program.methods
  //     .stubOracleCreate({ val: new BN(1) })
  //     .accounts({
  //       payer: adminKp.publicKey,
  //       oracle: oracleAId,
  //       mint: baseMint,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([adminKp])
  //     .rpc();
  // }
  // if ((await anchorProvider.connection.getAccountInfo(oracleBId)) == null) {
  //   await program.methods
  //     .stubOracleCreate({ val: new BN(1) })
  //     .accounts({
  //       payer: adminKp.publicKey,
  //       oracle: oracleBId,
  //       mint: quoteMint,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([adminKp])
  //     .rpc();
  // }

  // await program.methods
  //   .stubOracleSet({
  //     val: new BN(price),
  //   })
  //   .accounts({
  //     owner: adminKp.publicKey,
  //     oracle: oracleAId,
  //   })
  //   .signers([adminKp])
  //   .rpc();

  // await program.methods
  //   .stubOracleSet({
  //     val: new BN(price),
  //   })
  //   .accounts({
  //     owner: adminKp.publicKey,
  //     oracle: oracleBId,
  //   })
  //   .signers([adminKp])
  //   .rpc();

  const name = config.tokenData.symbol + "-SOL";
  /*
createMarketIx(
payer: PublicKey, 
name: string, q
uoteMint: PublicKey, 
baseMint: PublicKey, 
quoteLotSize: BN, 
baseLotSize: BN, 
makerFee: BN, 
takerFee: BN, 
timeExpiry: BN, 
oracleA: PublicKey | null, 
oracleB: PublicKey | null, 
openOrdersAdmin: PublicKey | null, 
consumeEventsAdmin: PublicKey | null, 
closeMarketAdmin: PublicKey | null, 
oracleConfigParams?: OracleConfigParams, 
market?: Keypair, 
collectFeeAdmin?: PublicKey)
*/
  const [ixs, signers] = await client.createMarketIx(
    authority.publicKey,
    name,
    quoteMint,
    baseMint,
    new BN(1),
    new BN(1000000),
    new BN(1000),
    new BN(1000),
    new BN(0),
    oracleAId,
    oracleBId,
    null,
    null,
    null
  );

  const tx = await client.sendAndConfirmTransaction(ixs, {
    additionalSigners: signers,
  });

  console.log("created market", tx);
  console.log(
    "finished with balance: ",
    await connection.getBalance(authority.publicKey)
  );
}

main();
