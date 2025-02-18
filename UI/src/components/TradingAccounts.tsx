import { Group, Loader, Table, Text, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
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
          <Loader size={20} />
        ) : (
          <IconRefresh
            onClick={() => {
              refresh();
            }}
            color="rgb(25, 113, 194)"
          />
        )}
      </Group>
      {wallets != undefined && wallets.length === 0 ? (
        <>
          {isLoading ? (
            <Loader mt={10} />
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
                  <Table.Tr key={item.keyPath}>
                    <Table.Td>{item.wallet}</Table.Td>
                    <Table.Td>{ilb ? <Loader size={15} /> : item.sol}</Table.Td>
                    <Table.Td>
                      {ilb ? <Loader size={20} /> : item.tokenBalance}
                    </Table.Td>
                    <Table.Td>
                      <Group>
                        <Confirm
                          text="Are you sure you swap all Sol for Tokens ?"
                          buttonText="Swap All Sol"
                          isLoading={isl}
                          confirm={async () => {
                            await swapIt({
                              mode: token.mode,
                              symbol: token.symbol,
                              keypair: item.keyPair,
                              swapOut: token.symbol,
                            });
                            const bal = await getBalance(item.keyPair);
                            if ("data" in bal) {
                              const wals = [...wallets];
                              wals[index] = {
                                ...wals[index],
                                sol: bal.data.sol,
                                tokenBalance: bal.data.token,
                              };
                              setWallets(wals);
                            }
                            notifications.show({
                              title: "Transaction Complete",
                              message: "The Transcation has Completed!",
                            });
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
                              keypair: item.keyPair,
                              swapOut: "SOL",
                            });
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
                              keypair: item.keyPair,
                              swapOut: token.symbol,
                              amount,
                            });
                            notifications.show({
                              title: "Transaction Complete",
                              message: "The Transcation has Completed!",
                            });
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
                              keypair: item.keyPair,
                              swapOut: "SOL",
                              amount,
                            });
                            notifications.show({
                              title: "Transaction Complete",
                              message: "The Transcation has Completed!",
                            });
                          }}
                          maxAmount={item.token}
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
                              keypathto: item.keyPair,
                              amount,
                            });
                            notifications.show({
                              title: "Transaction Complete",
                              message: "The Transcation has Completed!",
                            });
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
                              keypathto: item.keyPair,
                              amount,
                            });
                            notifications.show({
                              title: "Transaction Complete",
                              message: "The Transcation has Completed!",
                            });
                          }}
                          maxAmount={mbalance.tokenBalance}
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
