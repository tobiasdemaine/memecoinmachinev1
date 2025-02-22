/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Checkbox,
  FileInput,
  Group,
  Select,
  SimpleGrid,
  Box,
  Title,
  Center,
  Card,
  Loader,
  Text,
} from "@mantine/core";
import {
  useNewTokenStep1Mutation,
  backofficeApi,
  useStatusMutation,
} from "../redux/services/backofficeAPI";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { setRefetch, setToken } from "../redux/tokenSlice";
import { notifications } from "@mantine/notifications";
import { Confirm } from "../components/Confirm";

interface CreateData {
  //token
  mode: string; //select DEV | PROD
  symbol: string;
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
  pdf: File | null; // drag and drop mantine
  domain: string;
  ip4: string;
  ip6: string;
  ssh_user: string;
  ssh_password: string;

  //amount
  startAmount: number;
  tradingWalletsNumber: number;
  walletBaseAmount: number;

  // pool & market details
  lotSize: number;
  tickSize: number;
  addBaseAmountNumber: number;
  addQuoteAmountNumber: number;
  burnLiquidity: boolean;
  requestQueueSpacce: number;
  eventQueueSpacce: number;
  orderbookQueueSpacce: number;
}

export const NewPage = () => {
  //const []
  const [formData, setFormData] = useState<CreateData>({
    mode: "Devnet",
    symbol: "",
    description: "",
    name: "",
    initialSupply: 100_000_000,
    decimals: 8,
    url: "",
    logo: null,
    telgram: "",
    x: "",
    RPC_MAIN:
      "https://mainnet.helius-rpc.com/?api-key=858e2c68-23eb-489d-84c2-fb86acd26c7f",
    RPC_DEV:
      "https://devnet.helius-rpc.com/?api-key=858e2c68-23eb-489d-84c2-fb86acd26c7f",
    useWebsiteBuilder: false,
    hero: null,
    pdf: null,
    domain: "",
    ip4: "",
    ip6: "",
    ssh_user: "",
    ssh_password: "",
    startAmount: 5,
    tradingWalletsNumber: 1,
    walletBaseAmount: 1,
    lotSize: 1,
    tickSize: 0.0001,
    addBaseAmountNumber: 50_000_000,
    addQuoteAmountNumber: 1,
    burnLiquidity: false,
    requestQueueSpacce: 764,
    eventQueueSpacce: 11308,
    orderbookQueueSpacce: 14524,
  });
  const navigate = useNavigate();
  const [submitForm, { isLoading }] = useNewTokenStep1Mutation();
  const [getStatus] = useStatusMutation();
  const dispatch = useAppDispatch();
  const handleChange = (field: keyof CreateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const [load, setLoad] = useState(false);
  const handleSubmit = () => {
    const requiredFields = [
      "mode",
      "symbol",
      "description",
      "name",
      "initialSupply",
      "decimals",
      "url",
      "logo",
      "RPC_MAIN",
      "RPC_DEV",
      "startAmount",
      "tradingWalletsNumber",
      "walletBaseAmount",
      "lotSize",
      "tickSize",
      "addBaseAmountNumber",
      "addQuoteAmountNumber",
      // "burnLiquidity",
      "requestQueueSpacce",
      "eventQueueSpacce",
      "orderbookQueueSpacce",
    ];

    if (formData.useWebsiteBuilder) {
      requiredFields.push(
        "hero",
        "pdf",
        "domain",
        "ip4",
        "ip6",
        "ssh_user",
        "ssh_password"
      );
    }
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof CreateData]
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill the following required fields: ${missingFields.join(
          ", "
        )}}`
      );
    } else {
      // Submit form
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          if (value != null) formDataToSubmit.append(key, value);
        } else {
          if (value != null) formDataToSubmit.append(key, value.toString());
        }
      });

      submitForm(formDataToSubmit)
        .unwrap()
        .then((res) => {
          console.log(res);
          if (res.data == false) {
            return;
          }
          const getstatus = async () => {
            const res = await getStatus({
              symbol: formData.symbol,
              mode: formData.mode === "Devnet" ? "DEV" : "PROD",
            });
            console.log("#", res.data);
            if (res.data.data.status !== null) {
              dispatch(backofficeApi.util.invalidateTags(["tokens"]));

              dispatch(
                setToken({
                  symbol: res.data.data.tokenData.symbol,
                  mode: res.data.data.mode,
                  data: res.data.data,
                })
              );
              dispatch(setRefetch(true));
              navigate("/token");
            } else {
              setTimeout(getstatus, 500);
            }
          };
          setLoad(true);
          notifications.show({
            title: "Token Creation Started",
            message: "Please Wait!",
          });
          setTimeout(getstatus, 500);
        })
        .catch((error) => {
          notifications.show({
            title: "Error!",
            message: error,
          });
        });
    }
  };

  if (load) {
    // it is
    return (
      <>
        <Center>
          <Card>
            <Card.Section p={20}>
              <Center p={20}>
                <Loader size={70} />
              </Center>
            </Card.Section>
            <Card.Section p={20}>
              <Text ta="center" size="lg">
                Token creation in progress
              </Text>
            </Card.Section>
          </Card>
        </Center>
      </>
    );
  }

  return (
    <form>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
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
            value={formData.symbol}
            onChange={(e) => handleChange("symbol", e.target.value)}
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
            color="gray"
            label="Use Website Builder"
            checked={formData.useWebsiteBuilder}
            onChange={(e) =>
              handleChange("useWebsiteBuilder", e.currentTarget.checked)
            }
          />
          <FileInput
            label="Hero"
            onChange={(file) => handleChange("hero", file)}
            disabled={!formData.useWebsiteBuilder}
          />
          <FileInput
            label="PDF"
            onChange={(file) => handleChange("pdf", file)}
            disabled={!formData.useWebsiteBuilder}
          />
          <TextInput
            label="Domain"
            value={formData.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
            disabled={!formData.useWebsiteBuilder}
          />
          <TextInput
            label="IP4"
            value={formData.ip4}
            onChange={(e) => handleChange("ip4", e.target.value)}
            disabled={!formData.useWebsiteBuilder}
          />
          <TextInput
            label="IP6"
            value={formData.ip6}
            onChange={(e) => handleChange("ip6", e.target.value)}
            disabled={!formData.useWebsiteBuilder}
          />
          <TextInput
            label="SSH User"
            value={formData.ssh_user}
            onChange={(e) => handleChange("ssh_user", e.target.value)}
            disabled={!formData.useWebsiteBuilder}
          />
          <TextInput
            label="SSH Password"
            value={formData.ssh_password}
            onChange={(e) => handleChange("ssh_password", e.target.value)}
            disabled={!formData.useWebsiteBuilder}
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
            Pool & Market Details
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
          <Select
            label="Select Market Type"
            data={["0.4 SOL", "1.5 SOL", "2.8 SOL"]}
            onChange={(value) => {
              if (value === "0.4 SOL") {
                handleChange("requestQueueSpacce", 764);
                handleChange("eventQueueSpacce", 11308);
                handleChange("orderbookQueueSpacce", 14524);
              }
              if (value === "1.5 SOL") {
                handleChange("requestQueueSpacce", 5084);
                handleChange("eventQueueSpacce", 123244);
                handleChange("orderbookQueueSpacce", 32452);
              }
              if (value === "2.8 SOL") {
                handleChange("requestQueueSpacce", 5084);
                handleChange("eventQueueSpacce", 262108);
                handleChange("orderbookQueueSpacce", 65500);
              }
            }}
          />

          <NumberInput
            label="Request Queue Length"
            value={formData.requestQueueSpacce}
            onChange={(value) => handleChange("requestQueueSpacce", value)}
          />
          <NumberInput
            label="Event Queue Length"
            value={formData.eventQueueSpacce}
            onChange={(value) => handleChange("eventQueueSpacce", value)}
          />
          <NumberInput
            label="Orderbook Length"
            value={formData.orderbookQueueSpacce}
            onChange={(value) => handleChange("orderbookQueueSpacce", value)}
          />

          <NumberInput
            label="Amount of Tokens at start of pool"
            value={formData.addBaseAmountNumber}
            onChange={(value) => handleChange("addBaseAmountNumber", value)}
          />
          <NumberInput
            label="Amount of Sol at start of pool"
            value={formData.addQuoteAmountNumber}
            onChange={(value) => handleChange("addQuoteAmountNumber", value)}
          />
          <Checkbox
            color="gray"
            mt={10}
            label="Lock Pool"
            checked={formData.burnLiquidity}
            onChange={(e) =>
              handleChange("burnLiquidity", e.currentTarget.checked)
            }
          />
        </Box>
      </SimpleGrid>
      <Group mt="md">
        <Confirm
          text="Are you sure you want to create this token?"
          buttonText="Create Token"
          isLoading={isLoading}
          confirm={async () => {
            handleSubmit();
          }}
        />
      </Group>
    </form>
  );
};
