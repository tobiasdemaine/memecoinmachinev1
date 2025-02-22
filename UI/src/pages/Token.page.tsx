import { Card, Center, Loader, Text, Title } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import {
  useStatusMutation,
  useTradingAccountsMutation,
} from "../redux/services/backofficeAPI";
import { useEffect } from "react";

import { Token } from "../components/Token";
import { NewStep2Website } from "../components/NewStep2Website";

export const TokenPage = () => {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const [getStatus] = useStatusMutation();
  useTradingAccountsMutation();
  console.log(token);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const res = await getStatus({
        mode: token.data.mode,
        symbol: token.data.metaData.symbol,
      });
      dispatch(
        setToken({
          symbol: res.data.data.metaData.symbol,
          mode: res.data.data.mode,
          data: res.data.data,
        })
      );
      if (res.data.status === "complete") {
        clearInterval(intervalId);
      }
      if (res.data.status !== "token created" && res.data.website === "none") {
        clearInterval(intervalId);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [dispatch, getStatus, token.data.metaData.symbol, token.data.mode]);

  if (token.data.status === "complete") {
    return <Token />;
  }
  if (token.data.status === "token created" && token.data.website === "on") {
    return <NewStep2Website />;
  }

  return (
    <>
      <Center>
        <Card>
          <Card.Section p={20}>
            <Title ta="center" order={3}>
              TOKEN SETUP
            </Title>
          </Card.Section>
          <Card.Section p={20}>
            <Center p={20}>
              <Loader size={70} />
            </Center>
          </Card.Section>
          <Card.Section p={20}>
            <Text ta="center" size="lg">
              {token.data.status}
            </Text>
          </Card.Section>
        </Card>
      </Center>
    </>
  );
};
