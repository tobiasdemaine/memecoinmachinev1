/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, PublicKey } from "@solana/web3.js";
import * as IPFS from "ipfs-http-client";
import { AES, enc } from "crypto-js";
import { Buffer } from "buffer";

interface Config {
  solanaRpcUrl: string;
  ipfsGateway: string;
  encryptionKey: string;
}

export class EncryptedIPFSStorage {
  private ipfs: IPFS.IPFSHTTPClient;
  private config: Config;
  private solanaConnection: Connection;

  constructor(config: Config) {
    this.config = config;
    this.ipfs = IPFS.create({ url: config.ipfsGateway });
    this.solanaConnection = new Connection(config.solanaRpcUrl, "confirmed");
  }

  private encryptData(data: any): string {
    return AES.encrypt(
      JSON.stringify(data),
      this.config.encryptionKey
    ).toString();
  }

  private decryptData(encryptedData: string): any {
    const bytes = AES.decrypt(encryptedData, this.config.encryptionKey);
    return JSON.parse(bytes.toString(enc.Utf8));
  }

  private getIpfsPath(publicKey: PublicKey): string {
    return `/solana/${publicKey.toBase58()}/data.json`;
  }

  async storeData(publicKey: PublicKey, data: any): Promise<string> {
    const encryptedData = this.encryptData(data);
    const content = Buffer.from(encryptedData);
    const result = await this.ipfs.add({
      path: this.getIpfsPath(publicKey),
      content: content,
    });
    return result.cid.toString();
  }

  async loadData(publicKey: PublicKey): Promise<any> {
    const path = this.getIpfsPath(publicKey);
    const chunks = [];
    for await (const chunk of this.ipfs.cat(path)) {
      chunks.push(chunk);
    }
    const encryptedData = Buffer.concat(chunks).toString();
    return this.decryptData(encryptedData);
  }

  async verifyAccount(publicKey: PublicKey): Promise<boolean> {
    const accountInfo = await this.solanaConnection.getAccountInfo(publicKey);
    return accountInfo !== null;
  }
}
