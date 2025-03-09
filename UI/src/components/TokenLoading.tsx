import { Card, Center, Loader, Title, Text } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import { useEffect } from "react";
import { useStatusMutation } from "../redux/services/backofficeAPI";

export const TokenLoading = () => {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const [getStatus] = useStatusMutation();
  useEffect(() => {
    const getStatusF = async () => {
      console.log(token.data.status);
      if (
        token.data.status === "complete" ||
        (token.data.status === "token created" && token.data.website === "on")
      ) {
        console.log("cooked");
      } else {
        const res = await getStatus({
          mode: token.data.mode,
          symbol: token.data.metaData.symbol,
        });
        if (res.data.data.status !== token.data.status) {
          dispatch(
            setToken({
              symbol: res.data.data.metaData.symbol,
              mode: res.data.data.mode,
              data: res.data.data,
            })
          );
        }
        console.log(token.data);
      }
    };
    const interval = setInterval(() => {
      getStatusF();
    }, 5000);

    //Clearing the interval
    return () => clearInterval(interval);
    //
  }, [token]);

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
