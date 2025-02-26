/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { selectToken } from "../redux/tokenSlice";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  useMoveSolToWalletMutation,
  useMoveTokensToWalletMutation,
  useSellAllTokensMutation,
  useTradeSwapMutation,
  useTradeSwapSomeMutation,
  useTradingAccountsV2Mutation,
  useWithdrawFromAllAccountsMutation,
} from "../redux/services/backofficeAPI";
import { Confirm } from "./Confirm";
import {
  ActionIcon,
  CopyButton,
  Group,
  Loader,
  Stack,
  Table,
  Title,
  Tooltip,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { AmountModal } from "./AmountModal";
import { MenuModal } from "./MenuModal";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAccounts, setAccount } from "../redux/accountsSlice";

interface Balances {
  [address: string]: AddressBalance;
}

interface AddressBalance {
  sol: number;
  token: number;
}

export const TradingAccountsV2 = ({ balance }: { balance: any }) => {
  const token = useAppSelector(selectToken);
  const accounts = useAppSelector(selectAccounts);
  const dispatch = useAppDispatch();
  const [getTokenData, { data: tradingAccounts, isLoading }] =
    useTradingAccountsV2Mutation();

  const [doSolMove, { isLoading: il1 }] = useWithdrawFromAllAccountsMutation();
  const [doSellOut, { isLoading: il2 }] = useSellAllTokensMutation();
  const [swapIt, { isLoading: isl }] = useTradeSwapMutation();
  const [swapItAmount, { isLoading: isls }] = useTradeSwapSomeMutation();
  const [moveSol, { isLoading: ilms }] = useMoveSolToWalletMutation();
  const [moveToken, { isLoading: ilmt }] = useMoveTokensToWalletMutation();

  const [balances, setBalances] = React.useState<Balances>({});
  const [refresh, setRefresh] = React.useState(false);

  const connection = new Connection(
    token.mode === "PROD" ? token.data.RPC_MAIN : token.data.RPC_DEV
  );

  // Load initial token data
  useEffect(() => {
    getTokenData({ symbol: token.symbol, mode: token.mode }); // Assuming this endpoint returns list of addresses
  }, [getTokenData, token]);

  interface BalanceResult {
    address: string;
    solBalance: number;
    tokenBalance: number;
  }
  // Fetch balances for all addresses
  useEffect(() => {
    const fetchAllBalances = async () => {
      if (
        tradingAccounts &&
        tradingAccounts.data &&
        token?.data?.tokenData?.mintAccount
      ) {
        const tokenMint = new PublicKey(token.data.tokenData.mintAccount);
        const newBalances: Balances = {};

        try {
          // Fetch balances for each address in parallel
          const balancePromises = tradingAccounts.data.map(
            async (address: string) => {
              const pubKey = new PublicKey(address);

              const solBalance = await connection.getBalance(pubKey);

              const acc = accounts.accounts.find(
                (account) => account.account == address
              );

              let tokenBalance = 0;
              let tokenAccPK;
              try {
                if (acc && acc.tokenAccount) {
                  tokenAccPK = new PublicKey(acc?.tokenAccount);
                  const accountInfo = await connection.getTokenAccountBalance(
                    tokenAccPK
                  );
                  tokenBalance = accountInfo.value.uiAmount as number;
                } else {
                  const tokenAccounts =
                    await connection.getTokenAccountsByOwner(pubKey, {
                      mint: tokenMint,
                    });

                  if (tokenAccounts.value.length > 0) {
                    const accountInfo = await connection.getTokenAccountBalance(
                      tokenAccounts.value[0].pubkey
                    );
                    tokenAccPK = tokenAccounts.value[0].pubkey;
                    tokenBalance = accountInfo.value.uiAmount as number;
                  }

                  dispatch(
                    setAccount({
                      account: address,
                      tokenMint: tokenMint.toBase58(),
                      tokenAccount: tokenAccPK && tokenAccPK.toBase58(),
                      sol: solBalance,
                      token: tokenBalance,
                    })
                  );
                }
              } catch (err) {
                console.error(
                  `Error fetching token balance for ${address}:`,
                  err
                );
              }

              return {
                address,
                solBalance: solBalance / 1e9, // Convert lamports to SOL
                tokenBalance,
              };
            }
          );

          const results = await Promise.all(balancePromises);

          // Format results into an object with address as key
          results.forEach((result: BalanceResult) => {
            newBalances[result.address as string] = {
              sol: result.solBalance,
              token: result.tokenBalance,
            };
          });

          setBalances(newBalances);
        } catch (error) {
          console.error("Error fetching balances:", error);
        }
      }
    };

    fetchAllBalances();
    setRefresh(false);
  }, [tradingAccounts, token?.data?.tokenData?.mintAccount, refresh]);
  let cM = () => {};
  const closeMenu = (cl: any) => {
    cM = cl;
  };
  const getWalletFile = (index: number) => {
    return `tokens/wallets/${token.mode}_${token.symbol}_wallet_${
      index + 1
    }.json`;
  };

  const getBalance = async (address: string) => {
    const newBalances = { ...balances };
    const tokenMint = new PublicKey(token.data.tokenData.mintAccount);
    const pubKey = new PublicKey(address);

    const solBalance = await connection.getBalance(pubKey);
    const acc = accounts.accounts.find((account) => account.account == address);

    let tokenBalance = 0;
    let tokenAccPK;
    try {
      if (acc && acc.tokenAccount) {
        tokenAccPK = new PublicKey(acc?.tokenAccount);
        const accountInfo = await connection.getTokenAccountBalance(tokenAccPK);
        tokenBalance = accountInfo.value.uiAmount as number;
      } else {
        const tokenAccounts = await connection.getTokenAccountsByOwner(pubKey, {
          mint: tokenMint,
        });

        if (tokenAccounts.value.length > 0) {
          const accountInfo = await connection.getTokenAccountBalance(
            tokenAccounts.value[0].pubkey
          );
          tokenAccPK = tokenAccounts.value[0].pubkey;
          tokenBalance = accountInfo.value.uiAmount as number;
        }

        dispatch(
          setAccount({
            account: address,
            tokenMint: tokenMint.toBase58(),
            tokenAccount: tokenAccPK && tokenAccPK.toBase58(),
            sol: solBalance,
            token: tokenBalance,
          })
        );
      }
    } catch (err) {
      console.error(`Error fetching token balance for ${address}:`, err);
    }

    newBalances[address as string] = {
      sol: solBalance / 1e9,
      token: tokenBalance,
    };
  };
  return (
    <div>
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
                message: "The Transaction has Completed!",
              });
              setRefresh(true);
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
                message: "The Transaction has Completed!",
              });
              setRefresh(true);
            }}
          />
        </Group>
        {isLoading ? (
          <Loader color="grey" size={20} />
        ) : (
          <IconRefresh
            onClick={() => {
              setRefresh(true);
            }}
            color="grey"
          />
        )}
      </Group>

      {tradingAccounts != undefined && tradingAccounts.data.length === 0 ? (
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
              {tradingAccounts != undefined &&
                tradingAccounts.data.map((address: string, index: number) => (
                  <Table.Tr key={address}>
                    <Table.Td>
                      {address}
                      <CopyButton value={address} timeout={2000}>
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
                    <Table.Td>
                      {balances[address]?.sol !== undefined ? (
                        `${balances[address].sol} SOL`
                      ) : (
                        <Loader size={15} />
                      )}
                    </Table.Td>
                    <Table.Td>
                      {balances[address]?.token !== undefined ? (
                        balances[address].token
                      ) : (
                        <Loader size={15} />
                      )}
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
                                  await swapIt({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: getWalletFile(index),
                                    swapOut: token.symbol,
                                  });

                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });
                                  getBalance(address);
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
                                    keypair: getWalletFile(index),
                                    swapOut: "SOL",
                                  });

                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });
                                  cM();
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
                                    keypair: getWalletFile(index),
                                    swapOut: token.symbol,
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });
                                  getBalance(address);
                                  cM();
                                }}
                                maxAmount={
                                  balances[address]?.sol !== undefined
                                    ? balances[address].sol
                                    : 0
                                }
                              />
                              <AmountModal
                                text="Enter the Amount of Token to spend"
                                buttonText="Swap Token"
                                isLoading={isls}
                                confirm={async (amount: number) => {
                                  await swapItAmount({
                                    mode: token.mode,
                                    symbol: token.symbol,
                                    keypair: getWalletFile(index),
                                    swapOut: "SOL",
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });
                                  getBalance(address);
                                  cM();
                                }}
                                maxAmount={
                                  balances[address]?.token !== undefined
                                    ? balances[address].token
                                    : 0
                                }
                              />

                              <AmountModal
                                text="Enter the Amount of SOL to Deposit into this Account"
                                buttonText="Deposit SOL"
                                isLoading={ilms}
                                confirm={async (amount: number) => {
                                  await moveSol({
                                    mode: token.mode,
                                    symbol: "SOL",
                                    keypathfrom: `tokens/keys/${token.mode}_${token.symbol}-keypair.json`,
                                    keypathto: getWalletFile(index),
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });
                                  cM();
                                  getBalance(address);
                                }}
                                maxAmount={balance.sol}
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
                                    keypathto: getWalletFile(index),
                                    amount,
                                  });
                                  notifications.show({
                                    title: "Transaction Complete",
                                    message: "The Transaction has Completed!",
                                  });

                                  cM();
                                }}
                                maxAmount={
                                  balance.tokenBalance &&
                                  Array.isArray(balance.tokenBalance)
                                    ? balance.tokenBalance.filter(
                                        (t: any) => t.type === "token"
                                      )[0].amount
                                    : 100000000000
                                }
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
    </div>
  );
};
