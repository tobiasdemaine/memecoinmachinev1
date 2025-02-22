import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import {
  useAuditMutation,
  useTokenWalletBalanceMutation,
  useTradingAccountsMutation,
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
import { Audit } from "./Audit";
import { Website } from "./Website";
import { Account } from "./Account";
import { TradingAccounts } from "./TradingAccounts";
import { Data } from "./Data";
import { Pool } from "./Pool";

export const Token = () => {
  const token = useAppSelector(selectToken);
  const [getWatch, result] = useWatchMutation();
  const [getAudit, auditResult] = useAuditMutation();
  const [getBalance, balanceResult] = useTokenWalletBalanceMutation();
  const [getTradingAccounts, tradingAccountsResult] =
    useTradingAccountsMutation();

  useEffect(() => {
    getWatch({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
    getAudit({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
    getTradingAccounts({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
    getBalance({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
  }, [token.symbol]);

  const watchdata = result?.data?.data || null;
  const auditData = auditResult?.data?.data || [];
  const balanceData = balanceResult?.data?.data || null;
  const tradingAccountsData = tradingAccountsResult?.data?.data || [];

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
            Audit
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Audit">
          <Audit data={auditData} />
        </Tabs.Panel>

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
          <TradingAccounts
            data={tradingAccountsData}
            isLoading={tradingAccountsResult.isLoading}
            refresh={() => {
              getTradingAccounts({
                mode: token.data.mode,
                symbol: token.data.metaData.symbol,
              });
            }}
            balance={balanceResult}
          />
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
