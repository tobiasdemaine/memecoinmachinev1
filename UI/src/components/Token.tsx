import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import {
  useTokenWalletBalanceMutation,
  useWatchMutation,
} from "../redux/services/backofficeAPI";
import { selectToken } from "../redux/tokenSlice";
import { Tabs } from "@mantine/core";
import {
  IconCoin,
  IconFileDatabase,
  IconPool,
  IconUsers,
  IconWebhook,
} from "@tabler/icons-react";
import { Website } from "./Website";
import { Account } from "./Account";
import { Data } from "./Data";
import { Pool } from "./Pool";
import { TradingAccountsV2 } from "./TradingAccountsv2";

export const Token = () => {
  const token = useAppSelector(selectToken);
  const [getWatch, result] = useWatchMutation();
  const [getBalance, balanceResult] = useTokenWalletBalanceMutation();

  useEffect(() => {
    getWatch({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
    getBalance({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
  }, [token.symbol]);

  const watchdata = result?.data?.data || null;
  const balanceData = balanceResult?.data?.data || null;

  return (
    <>
      <Tabs defaultValue={"Pool"} color="green">
        <Tabs.List>
          <Tabs.Tab value="Pool" leftSection={<IconPool size={12} />}>
            Pool
          </Tabs.Tab>
          <Tabs.Tab value="Account" leftSection={<IconUsers size={12} />}>
            Accounts
          </Tabs.Tab>
          {token.data.website.status == "on" && (
            <Tabs.Tab value="Website" leftSection={<IconWebhook size={12} />}>
              Website
            </Tabs.Tab>
          )}

          <Tabs.Tab value="Data" leftSection={<IconFileDatabase size={12} />}>
            Data
          </Tabs.Tab>
          <Tabs.Tab value="Audit" leftSection={<IconCoin size={12} />}>
            Transactions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Website">
          <Website />
        </Tabs.Panel>

        <Tabs.Panel value="Account">
          <Account
            data={balanceData}
            refresh={() => {
              getBalance({
                mode: token.data.mode,
                symbol: token.data.metaData.symbol,
              });
            }}
            isLoading={balanceResult.isLoading}
          />
          {/* <TradingAccounts
            data={tradingAccountsData}
            isLoading={tradingAccountsResult.isLoading}
            refresh={() => {
              getTradingAccounts({
                mode: token.data.mode,
                symbol: token.data.metaData.symbol,
              });
            }}
            balance={balanceResult}
          /> */}
          <TradingAccountsV2 balance={balanceResult} />
        </Tabs.Panel>

        <Tabs.Panel value="Data">
          <Data token={token} />
        </Tabs.Panel>
        <Tabs.Panel value="Pool" pt={10}>
          <Pool
            watchdata={watchdata}
            refresh={() => {
              getWatch({
                mode: token.data.mode,
                symbol: token.data.metaData.symbol,
              });
            }}
            isLoading={result.isLoading}
            mode={token.data.mode}
            symbol={token.data.metaData.symbol}
          />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};
