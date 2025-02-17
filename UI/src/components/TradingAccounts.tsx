import { Group, Loader, Table, Text, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { Confirm } from "./Confirm";
import { notifications } from "@mantine/notifications";
import {
  useSellAllTokensMutation,
  useTradeSwapMutation,
  useTradeSwapSomeMutation,
  useWithdrawFromAllAccountsMutation,
} from "../redux/services/backofficeAPI";
import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/tokenSlice";
import { AmountModal } from "./AmountModal";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const TradingAccounts = ({
  data,
  isLoading,
  refresh,
}: {
  data: any[];
  isLoading: boolean;
  refresh: () => void;
}) => {
  const token = useAppSelector(selectToken);
  const [doSolMove, { isLoading: il1 }] = useWithdrawFromAllAccountsMutation();
  const [doSellOut, { isLoading: il2 }] = useSellAllTokensMutation();
  const [swapIt, { isLoading: isl }] = useTradeSwapMutation();
  const [swapItAmount, { isLoading: isls }] = useTradeSwapSomeMutation();
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
            }}
          />
        </Group>
        <IconRefresh
          onClick={() => {
            refresh();
          }}
          color="rgb(25, 113, 194)"
        />
      </Group>
      {data.length === 0 ? (
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
              {data.map((item) => (
                <Table.Tr>
                  <Table.Td>{item.wallet}</Table.Td>
                  <Table.Td>{item.sol}</Table.Td>
                  <Table.Td>{item.tokenBalance}</Table.Td>
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
