import { Card, Center, Loader, Tabs, Text } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import {
  useAuditMutation,
  useStatusMutation,
  useTokenWalletBalanceMutation,
  useTradingAccountsMutation,
  useWatchMutation,
} from "../redux/services/backofficeAPI";
import { useEffect } from "react";
import {
  IconCoin,
  IconFileDatabase,
  IconPool,
  IconUsers,
  IconWebhook,
} from "@tabler/icons-react";
import { Audit } from "../components/Audit";
import { TradingAccounts } from "../components/TradingAccounts";
import { Data } from "../components/Data";
import { Pool } from "../components/Pool";
import { Account } from "../components/Account";
import { Website } from "../components/Website";

export const TokenPage = () => {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const [getWatch, result] = useWatchMutation();
  const [getAudit, auditResult] = useAuditMutation();
  const [getBalance, balanceResult] = useTokenWalletBalanceMutation();
  const [getStatus] = useStatusMutation();
  const [getTradingAccounts, tradingAccountsResult] =
    useTradingAccountsMutation();
  console.log(token, result?.data?.data);

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
  }, []);

  const watchdata = result?.data?.data || null;
  const auditData = auditResult?.data?.data || [];
  const balanceData = balanceResult?.data?.data || null;
  console.log(tradingAccountsResult);
  const tradingAccountsData = tradingAccountsResult?.data?.data || [];

  const getSTATUS = async () => {
    const res = await getStatus({
      mode: token.data.mode,
      symbol: token.data.metaData.symbol,
    });
    if (res.data.status == token.data.status) {
      setTimeout(getSTATUS, 500);
    } else {
      dispatch(
        setToken({
          symbol: res.data.tokenData.symbol,
          mode: res.data.mode,
          data: res.data,
        })
      );
    }
  };

  useEffect(() => {
    if (
      token.data.status !== "complete" &&
      token.data.status !== "token created" &&
      token.data.website === "none"
    ) {
      getSTATUS();
    }
  }, [token]);

  if (token.data.status !== "complete")
    return (
      <>
        <Tabs defaultValue={"Pool"}>
          <Tabs.List>
            <Tabs.Tab value="Pool" leftSection={<IconPool size={12} />}>
              Pool
            </Tabs.Tab>
            <Tabs.Tab value="Account" leftSection={<IconUsers size={12} />}>
              Accounts
            </Tabs.Tab>

            <Tabs.Tab value="Website" leftSection={<IconWebhook size={12} />}>
              Website
            </Tabs.Tab>
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

  if (token.data.status !== "token created" && token.data.website === "none")
    return <>WEBSITE BUILDER</>;

  return (
    <>
      <Center>
        <Card>
          <Card.Section>
            <Center>
              <Loader size={70} />
            </Center>
          </Card.Section>
          <Card.Section>
            <Text size="lg">{token.data.status}</Text>
          </Card.Section>
        </Card>
      </Center>
    </>
  );
};
