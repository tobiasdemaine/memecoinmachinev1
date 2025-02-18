/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Card, SimpleGrid, Text, Title } from "@mantine/core";
import { useMasterWalletBalanceMutation } from "../redux/services/backofficeAPI";
import { useEffect, useState } from "react";

export const DashboardPage = () => {
  const [getBalance] = useMasterWalletBalanceMutation();
  const [devBalance, setDevBalance] = useState<any>();
  const [mainnetBalance, setMainnetBalance] = useState<any>();

  const getBalances = async () => {
    const db = await getBalance({
      mode: "DEV",
    });
    setDevBalance(db);
    const mb = await getBalance({
      mode: "PROD",
    });
    setMainnetBalance(mb);
  };
  useEffect(() => {
    getBalances();
  }, []);
  return (
    <>
      <Card>
        <Text>
          Deposit Mainnet & Dev SOL to :{" "}
          <strong>{devBalance && devBalance.data?.data?.wallet}</strong>
        </Text>
      </Card>
      <SimpleGrid cols={3} mt={20}>
        <Card>
          <Title order={4}>MainNet</Title>
          <Box>
            Sol:{" "}
            <strong>{mainnetBalance && mainnetBalance.data?.data?.sol}</strong>
          </Box>
        </Card>
        <Card>
          <Title order={4}>DevNet</Title>

          <Box>
            Sol: <strong>{devBalance && devBalance.data?.data?.sol}</strong>
          </Box>
        </Card>
      </SimpleGrid>
    </>
  );
};
