/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, NavLink, Title } from "@mantine/core";
import {
  useSwitchTokenMutation,
  useTokensQuery,
} from "../redux/services/backofficeAPI";
import { useEffect } from "react";
import { IconCoin } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import { setToken } from "../redux/tokenSlice";

export const TokensPage = () => {
  const { data, isLoading, refetch } = useTokensQuery();
  const [updatePost] = useSwitchTokenMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tokens = data?.data ?? [];
  useEffect(() => {
    refetch();
  }, []);
  console.log(tokens, isLoading);
  return (
    <>
      <Title order={4}>TOKENS</Title>
      {tokens &&
        tokens.map((token: any) => (
          <Box key={token.url}>
            <NavLink
              leftSection={<IconCoin size="1rem" stroke={1.5} />}
              onClick={async () => {
                await updatePost({
                  mode: token.mode,
                  symbol: token.metaData.symbol,
                });
                dispatch(
                  setToken({
                    mode: token.mode,
                    symbol: token.metaData.symbol,
                    data: token,
                  })
                );
                navigate("/token");
              }}
              label={token.mode + "_" + token.metaData?.symbol}
            />
          </Box>
        ))}
    </>
  );
};
