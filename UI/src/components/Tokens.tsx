/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink, Text } from "@mantine/core";
import {
  useSwitchTokenMutation,
  useTokensQuery,
} from "../redux/services/backofficeAPI";
import { useEffect } from "react";
import { IconCoin } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setRefetch, setToken } from "../redux/tokenSlice";

export const Tokens = () => {
  const { data, isLoading, refetch } = useTokensQuery();
  const [updatePost] = useSwitchTokenMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const tokens = data?.data ?? [];
  useEffect(() => {
    if (token.refetch) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [token]);

  console.log("TOKENS is LOADING", isLoading);
  return (
    <>
      <Text fz="xs">Mainnet</Text>
      {tokens &&
        tokens
          .filter((token: any) => token.mode === "PROD")
          .map((token: any) => (
            <NavLink
              key={token.url}
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
              label={token.metaData?.symbol}
            />
          ))}
      <Text fz="xs">Devnet</Text>
      {tokens &&
        tokens
          .filter((token: any) => token.mode === "DEV")
          .map((token: any) => (
            <NavLink
              key={token.url}
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
              label={token.metaData?.symbol}
            />
          ))}
    </>
  );
};
