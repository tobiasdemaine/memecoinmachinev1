/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionIcon,
  Box,
  Card,
  CopyButton,
  SimpleGrid,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMasterWalletBalanceMutation } from "../redux/services/backofficeAPI";
import { useEffect, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

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
          <CopyButton
            value={devBalance ? devBalance.data?.data?.wallet : ""}
            timeout={2000}
          >
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy"}
                withArrow
                position="right"
              >
                <ActionIcon
                  color={copied ? "teal" : "gray"}
                  variant="subtle"
                  onClick={copy}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Text>
      </Card>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mt={20}>
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
