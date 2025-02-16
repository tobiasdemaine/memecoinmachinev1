/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Checkbox,
  FileInput,
  Button,
  Group,
  Select,
  SimpleGrid,
  Box,
  Title,
} from "@mantine/core";

interface CreateData {
  //token
  mode: string; //select DEV | PROD
  Symbol: string;
  description: string;
  name: string;
  initialSupply: number;
  decimals: number;
  url: string;
  logo: File | null; // drag and drop mantine
  telgram?: string;
  x?: string;

  // RPC
  RPC_MAIN: string;
  RPC_DEV: string;

  //website
  useWebsiteBuilder: boolean; // checkbox mantine
  hero: File | null; // drag and drop mantine
  domain: string;
  ip4: string;
  ip6: string;
  ssh_user: string;
  ssh_password: string;

  //amount
  startAmount: number;
  tradingWalletsNumber: number;
  walletBaseAmount: number;

  // pool details
  lotSize: number;
  tickSize: number;
  addBaseAmountNumber: number;
  addQuoteAmountNumber: number;
}

export const NewPage = () => {
  const [formData, setFormData] = useState<CreateData>({
    mode: "Devnet",
    Symbol: "",
    description: "",
    name: "",
    initialSupply: 10_000_000,
    decimals: 9,
    url: "",
    logo: null,
    telgram: "",
    x: "",
    RPC_MAIN:
      "https://mainnet.helius-rpc.com/?api-key=858e2c68-23eb-489d-84c2-fb86acd26c7f",
    RPC_DEV:
      "https://devnet.helius-rpc.com/?api-key=858e2c68-23eb-489d-84c2-fb86acd26c7f",
    useWebsiteBuilder: true,
    hero: null,
    domain: "",
    ip4: "",
    ip6: "",
    ssh_user: "",
    ssh_password: "",
    startAmount: 6,
    tradingWalletsNumber: 20,
    walletBaseAmount: 2,
    lotSize: 1,
    tickSize: 0.0001,
    addBaseAmountNumber: 700000,
    addQuoteAmountNumber: 1,
  });

  const handleChange = (field: keyof CreateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "mode",
      "Symbol",
      "description",
      "name",
      "initialSupply",
      "decimals",
      "url",
      "logo",
      "RPC_MAIN",
      "RPC_DEV",
      "useWebsiteBuilder",
      "hero",
      "domain",
      "ip4",
      "ip6",
      "ssh_user",
      "ssh_password",
      "startAmount",
      "tradingWalletsNumber",
      "walletBaseAmount",
      "lotSize",
      "tickSize",
      "addBaseAmountNumber",
      "addQuoteAmountNumber",
    ];
    const isValid = requiredFields.every(
      (field) => formData[field as keyof CreateData]
    );
    if (!isValid) {
      alert("Please fill all required fields");
    } else {
      // Submit form
    }
  };

  return (
    <form>
      <SimpleGrid cols={3}>
        <Box>
          <Title order={3}>Token</Title>
          <Select
            label="Mode"
            value={formData.mode}
            data={["Devnet", "MainNet"]}
            onChange={(value) => handleChange("mode", value)}
          />
          <TextInput
            label="Symbol"
            value={formData.Symbol}
            onChange={(e) => handleChange("Symbol", e.target.value)}
          />
          <TextInput
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <TextInput
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <NumberInput
            label="Initial Supply"
            value={formData.initialSupply}
            onChange={(value) => handleChange("initialSupply", value)}
          />
          <NumberInput
            label="Decimals"
            value={formData.decimals}
            onChange={(value) => handleChange("decimals", value)}
          />
          <TextInput
            label="URL"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
          />
          <FileInput
            label="Logo"
            onChange={(file) => handleChange("logo", file)}
          />
          <TextInput
            label="Telegram"
            value={formData.telgram}
            onChange={(e) => handleChange("telgram", e.target.value)}
          />
          <TextInput
            label="X"
            value={formData.x}
            onChange={(e) => handleChange("x", e.target.value)}
          />
        </Box>
        <Box>
          <Title order={3}>RPC</Title>
          <TextInput
            label="RPC Main"
            value={formData.RPC_MAIN}
            onChange={(e) => handleChange("RPC_MAIN", e.target.value)}
          />
          <TextInput
            label="RPC Dev"
            value={formData.RPC_DEV}
            onChange={(e) => handleChange("RPC_DEV", e.target.value)}
          />

          <Title order={3} mt={10}>
            Website
          </Title>
          <Checkbox
            label="Use Website Builder"
            checked={formData.useWebsiteBuilder}
            onChange={(e) =>
              handleChange("useWebsiteBuilder", e.currentTarget.checked)
            }
          />
          <FileInput
            label="Hero"
            onChange={(file) => handleChange("hero", file)}
          />
          <TextInput
            label="Domain"
            value={formData.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
          />
          <TextInput
            label="IP4"
            value={formData.ip4}
            onChange={(e) => handleChange("ip4", e.target.value)}
          />
          <TextInput
            label="IP6"
            value={formData.ip6}
            onChange={(e) => handleChange("ip6", e.target.value)}
          />
          <TextInput
            label="SSH User"
            value={formData.ssh_user}
            onChange={(e) => handleChange("ssh_user", e.target.value)}
          />
          <TextInput
            label="SSH Password"
            value={formData.ssh_password}
            onChange={(e) => handleChange("ssh_password", e.target.value)}
          />
        </Box>
        <Box>
          <Title order={3}>Amount</Title>
          <NumberInput
            label="Start Amount"
            value={formData.startAmount}
            onChange={(value) => handleChange("startAmount", value)}
          />
          <NumberInput
            label="Trading Wallets Number"
            value={formData.tradingWalletsNumber}
            onChange={(value) => handleChange("tradingWalletsNumber", value)}
          />
          <NumberInput
            label="Wallet Base Amount"
            value={formData.walletBaseAmount}
            onChange={(value) => handleChange("walletBaseAmount", value)}
          />

          <Title order={3} mt={10}>
            Pool Details
          </Title>
          <NumberInput
            label="Lot Size"
            value={formData.lotSize}
            onChange={(value) => handleChange("lotSize", value)}
          />
          <NumberInput
            label="Tick Size"
            value={formData.tickSize}
            onChange={(value) => handleChange("tickSize", value)}
          />
          <NumberInput
            label="Add Base Amount Number"
            value={formData.addBaseAmountNumber}
            onChange={(value) => handleChange("addBaseAmountNumber", value)}
          />
          <NumberInput
            label="Add Quote Amount Number"
            value={formData.addQuoteAmountNumber}
            onChange={(value) => handleChange("addQuoteAmountNumber", value)}
          />
        </Box>
      </SimpleGrid>
      <Group mt="md">
        <Button onClick={handleSubmit}>Next Step</Button>
      </Group>
    </form>
  );
};
