import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import { useStatusMutation } from "../redux/services/backofficeAPI";
import { useEffect } from "react";

import { Token } from "../components/Token";
import { NewStep2Website } from "../components/NewStep2Website";
import { TokenLoading } from "../components/TokenLoading";

export const TokenPage = () => {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const [getStatus] = useStatusMutation();
  useEffect(() => {
    const getStatusF = async () => {
      if (
        token.data.status !== "complete" ||
        (token.data.status !== "token created" && token.data.website !== "none")
      ) {
        const res = await getStatus({
          mode: token.data.mode,
          symbol: token.data.metaData.symbol,
        });
        console.log(res);
        dispatch(
          setToken({
            symbol: res.data.data.metaData.symbol,
            mode: res.data.data.mode,
            data: res.data.data,
          })
        );
        //setTimeout(getStatusF, 2000);
      }
    };
    // Cleanup on unmount
    getStatusF();
  }, []);
  console.log(token);
  if (token.data.status === "complete") {
    return <Token />;
  }
  if (token.data.status === "token created" && token.data.website === "on") {
    return <NewStep2Website />;
  }

  return <TokenLoading />;
};
