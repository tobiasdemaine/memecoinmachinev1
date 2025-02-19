import {
  ActionIcon,
  CopyButton,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { Confirm } from "./Confirm";
import { notifications } from "@mantine/notifications";
import {
  useGetBalanceMutation,
  useMoveSolToWalletMutation,
  useMoveTokensToWalletMutation,
  useSellAllTokensMutation,
  useTradeSwapMutation,
  useTradeSwapSomeMutation,
  useWithdrawFromAllAccountsMutation,
} from "../redux/services/backofficeAPI";
import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/tokenSlice";
import { AmountModal } from "./AmountModal";
import { useEffect, useState } from "react";
import { MenuModal } from "./MenuModal";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const TradingAccounts = ({
  data,
  isLoading,
  refresh,
  balance,
}: {
  data: any[];
  isLoading: boolean;
  refresh: () => void;
  balance: any;
}) => {
  const token = useAppSelector(selectToken);
  const [doSolMove, { isLoading: il1 }] = useWithdrawFromAllAccountsMutation();
  const [doSellOut, { isLoading: il2 }] = useSellAllTokensMutation();
  const [swapIt, { isLoading: isl }] = useTradeSwapMutation();
  const [swapItAmount, { isLoading: isls }] = useTradeSwapSomeMutation();
  const [getBalance, { isLoading: ilb }] = useGetBalanceMutation();
  const [moveSol, { isLoading: ilms }] = useMoveSolToWalletMutation();
  const [moveToken, { isLoading: ilmt }] = useMoveTokensToWalletMutation();

  const [wallets, setWallets] = useState<any[]>();
  const [mbalance, setBalance] = useState<any>({
    tokenBalance: 0,
    sol: 0,
    wallet: "",
  });

  const saveData = (dataToSave: any) => {
    localStorage.setItem(
      `${token.mode}_${token.symbol}_trading_accounts`,
      JSON.stringify(dataToSave)
    );
  };

  const loadData = () => {
    const savedData = localStorage.getItem(
      `${token.mode}_${token.symbol}_trading_accounts`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  };

  useEffect(() => {
    const ld = loadData();
    if (data.length === 0) {
      setWallets(ld);
    } else {
      setWallets([...data]);
      saveData([...data]);
    }
  }, [data]);

  useEffect(() => {
    if ("data" in balance) {
      setBalance({ ...balance.data.data });
    }
  }, [balance]);
  console.log("wallets", wallets);

  let cM = () => {};
  const closeMenu = (cl: any) => {
    cM = cl;
  };

  return (
    <>
      <Title order={4} mt={20}>
        Trading Accounts
      </Title>
      <Group justify="space-between" mt={10} pb={5}>
        <Group>
          <Confirm
            text="Are you sure you want to move all of the Sol from all accounts?"
            buttonText="Move all Sol to Main Account"
            isLoading={il1}
            confirm={async () => {
              await doSolMove({
                mode: token.mode,
                symbol: token.symbol,
              });
              notifications.show({
                title: "Transaction Complete",
                message: "The Transcation has Completed!",
              });
              refresh();
            }}
          />
          <Confirm
            text="Are you sure you want to sell all of the Tokens from all accounts?"
            buttonText="Sell All Tokens"
            isLoading={il2}
            confirm={async () => {
              await doSellOut({
                mode: token.mode,
                symbol: token.symbol,
              });
              notifications.show({
                title: "Transaction Complete",
                message: "The Transcation has Completed!",
              });
              refresh();
            }}
          />
        </Group>
        {isLoading ? (
          <Loader color="grey" size={20} />
        ) : (
          <IconRefresh
            onClick={() => {
              refresh();
            }}
            color="grey"
          />
        )}
      </Group>
      {wallets != undefined && wallets.length === 0 ? (
        <>
          {isLoading ? (
            <Loader mt={10} color="grey" />
          ) : (
            <Text mt={10}>NO TRADING ACCOUNTS</Text>
          )}
        </>
      ) : (
        <>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Address</Table.Th>
                <Table.Th>SOL</Table.Th>
                <Table.Th>Token</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {wallets != undefined &&
                wallets.map((item, index) => (
                  <Table.Tr key={item.walletFile}>
                    <Table.Td>
                      {item.wallet}
                      <CopyButton value={item.wallet} timeout={2000}>
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
                              {copied ? (
                                <IconCheck size={16} />
                              ) : (
                                <IconCopy size={16} />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Table.Td>
                    <Table.Td>{ilb ? <Loader size={15} /> : item.sol}</Table.Td>
                    <Table.Td>
                      {ilb ? <Loader size={20} /> : item.tokenBalance}
                    </Table.Td>
                    <Table.Td>
                      <Group>
                        <MenuModal
                          closeIt={(c) => closeMenu(c)}
                          menu={
                            <Stack gap={5}>
                              <Confirm
                                text="Are you sure you swap all Sol for Tokens ?"
                                buttonText="Swap All Sol"
                                isLoading={isl}
                                theme={{
                                  w: "100%",
                                  bg: "gray",
                                  variant: "transparent",
                                  c: "white",
                                }}
                                confirm={async () => {
                                  console.log({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: item.walletFile,
                                    swapOut: token.symbol,
                                    item,
                                  });
                                  await swapIt({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: item.walletFile,
                                    swapOut: token.symbol,
                                  });
                                  const bal = await getBalance({
                                    keypair: item.walletFile,
                                  });
                                  if ("data" in bal) {
                                    const wals = [...wallets];
                                    wals[index] = {
                                      ...wals[index],
                                      sol: bal.data.data.sol,
                                      tokenBalance: bal.data.data.token,
                                    };
                                    setWallets(wals);
                                  }
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                  cM();
                                }}
                              />
                              <Confirm
                                text="Are you sure you swap all Tokens for Sol ?"
                                buttonText="Swap All Tokens"
                                isLoading={isl}
                                confirm={async () => {
                                  await swapIt({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: item.walletFile,
                                    swapOut: "SOL",
                                  });
                                  const bal = await getBalance({
                                    keypair: item.walletFile,
                                  });
                                  if ("data" in bal) {
                                    const wals = [...wallets];
                                    wals[index] = {
                                      ...wals[index],
                                      sol: bal.data.data.sol,
                                      tokenBalance: bal.data.data.token,
                                    };
                                    setWallets(wals);
                                  }
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                }}
                              />
                              <AmountModal
                                text="Enter the Amount of Sol to spend"
                                buttonText="Swap Sol"
                                isLoading={isls}
                                confirm={async (amount: number) => {
                                  await swapItAmount({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: item.walletFile,
                                    swapOut: token.symbol,
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                  const bal = await getBalance({
                                    keypair: item.walletFile,
                                  });
                                  if ("data" in bal) {
                                    const wals = [...wallets];
                                    wals[index] = {
                                      ...wals[index],
                                      sol: bal.data.data.sol,
                                      tokenBalance: bal.data.data.token,
                                    };
                                    setWallets(wals);
                                  }
                                  cM();
                                }}
                                maxAmount={item.sol}
                              />
                              <AmountModal
                                text="Enter the Amount of Token to spend"
                                buttonText="Swap Token"
                                isLoading={isls}
                                confirm={async (amount: number) => {
                                  await swapItAmount({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: item.walletFile,
                                    swapOut: "SOL",
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                  const bal = await getBalance({
                                    keypair: item.walletFile,
                                  });
                                  if ("data" in bal) {
                                    const wals = [...wallets];
                                    wals[index] = {
                                      ...wals[index],
                                      sol: bal.data.data.sol,
                                      tokenBalance: bal.data.data.token,
                                    };
                                    setWallets(wals);
                                  }
                                  cM();
                                }}
                                maxAmount={item.tokenBalance}
                              />

                              <AmountModal
                                text="Enter the Amount of SOL to Deposit into this Account"
                                buttonText="Deposit SOL"
                                isLoading={ilms}
                                confirm={async (amount: number) => {
                                  await moveSol({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypathfrom: `tokens/keys/${token.mode}_${token.symbol}-keypair.json`,
                                    keypathto: item.walletFile,
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                  cM();
                                }}
                                maxAmount={mbalance.sol}
                              />

                              <AmountModal
                                text="Enter the Amount of Tokens to Deposit into this Account"
                                buttonText="Deposit Tokens"
                                isLoading={ilmt}
                                confirm={async (amount: number) => {
                                  await moveToken({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypathfrom: `tokens/keys/${token.mode}_${token.symbol}-keypair.json`,
                                    keypathto: item.walletFile,
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transcation has Completed!",
                                  });
                                  cM();
                                }}
                                maxAmount={mbalance.tokenBalance}
                              />
                            </Stack>
                          }
                        />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </>
  );
};
