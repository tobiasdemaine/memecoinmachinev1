/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Card,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Confirm } from "../components/Confirm";
import {
  useMasterWalletBalanceMutation,
  useMasterWalletSpendMutation,
} from "../redux/services/backofficeAPI";
import { notifications } from "@mantine/notifications";

export const WithdrawPage = () => {
  const [masterSpend, { isLoading }] = useMasterWalletSpendMutation();
  const [getBalance] = useMasterWalletBalanceMutation();
  const [devBalance, setDevBalance] = useState<any>();
  const [mainnetBalance, setMainnetBalance] = useState<any>();

  const getBalances = async () => {
    setDevBalance(
      await getBalance({
        mode: "DEV",
      })
    );
    setMainnetBalance(
      await getBalance({
        mode: "PROD",
      })
    );
  };
  useEffect(() => {
    getBalances();
  }, []);
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );

  const [withdrawAddress, setWithdrawAddress] = useState<string | undefined>(
    undefined
  );

  const [network, setNetwork] = useState<string | undefined | null>(undefined);
  return (
    <>
      <Stack>
        <SimpleGrid cols={2}>
          <Card>
            <Title order={4}>MainNet</Title>
            <Box>
              Sol:{" "}
              <strong>
                {mainnetBalance && mainnetBalance.data?.data?.sol}
              </strong>
            </Box>
          </Card>
          <Card>
            <Title order={4}>DevNet</Title>

            <Box>
              Sol: <strong>{devBalance && devBalance.data?.data?.sol}</strong>
            </Box>
          </Card>
        </SimpleGrid>
        <Select
          label="Select Network"
          placeholder="Pick Network"
          data={["Mainnet", "Devnet"]}
          value={network}
          onChange={(value) => setNetwork(value)}
        />
        <TextInput
          value={withdrawAddress}
          onChange={(event) => setWithdrawAddress(event.currentTarget.value)}
          label="Withdraw Address"
          placeholder="Withdraw Address"
        />
        <NumberInput
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Withdraw Amount"
          placeholder="Enter amount"
        />
        {network && withdrawAmount && withdrawAddress && (
          <Confirm
            text="Are you sure?"
            buttonText="Withdraw"
            isLoading={isLoading}
            confirm={async () => {
              if (network && withdrawAmount && withdrawAddress) {
                await masterSpend({
                  address: withdrawAddress,
                  amount: withdrawAmount,
                  mode: network === "Mainnet" ? "PROD" : "DEV",
                });
                getBalances();
                notifications.show({
                  title: "Transaction Complete",
                  message: "The Transcation has Completed!",
                });
              }
            }}
          />
        )}
      </Stack>
    </>
  );
};
