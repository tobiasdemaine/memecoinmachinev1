/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { EncryptedIPFSStorage } from "../lib/EncryptedIPFSStorage";

interface IPFSContextType {
  data: any;
  loading: boolean;
  error: string | null;
  storeData: (newData: any) => Promise<void>;
}

const IPFSContext = createContext<IPFSContextType | undefined>(undefined);

const config = {
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  ipfsGateway: "http://localhost:5001",
  encryptionKey: "your-secret-key-32-chars-long!!!",
};

export const IPFSProvider: React.FC<{
  publicKey: string;
  children: React.ReactNode;
}> = ({ publicKey, children }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storage = new EncryptedIPFSStorage(config);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const pubKey = new PublicKey(publicKey);
        const isValid = await storage.verifyAccount(pubKey);
        if (!isValid) throw new Error("Invalid Solana account");
        const loadedData = await storage.loadData(pubKey);
        setData(loadedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [publicKey]);

  const storeData = async (newData: any) => {
    try {
      setLoading(true);
      const pubKey = new PublicKey(publicKey);
      await storage.storeData(pubKey, newData);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IPFSContext.Provider value={{ data, loading, error, storeData }}>
      {children}
    </IPFSContext.Provider>
  );
};

export const useIPFS = () => {
  const context = useContext(IPFSContext);
  if (!context) throw new Error("useIPFS must be used within IPFSProvider");
  return context;
};
