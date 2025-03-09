import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/tokenSlice";

import { Token } from "../components/Token";
import { NewStep2Website } from "../components/NewStep2Website";
import { TokenLoading } from "../components/TokenLoading";

export const TokenPage = () => {
  const token = useAppSelector(selectToken);

  if (token.data.status === "complete") {
    return <Token key={token.mode + "_" + token.symbol} />;
  } else if (
    token.data.status === "token created" &&
    token.data.website === "on"
  ) {
    return <NewStep2Website />;
  } else {
    return <TokenLoading />;
  }
};
