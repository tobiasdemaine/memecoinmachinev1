/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from "@mantine/notifications";
import { useAppSelector } from "../redux/hooks";
import { useTranferSoltoMasterMutation } from "../redux/services/backofficeAPI";
import { selectToken } from "../redux/tokenSlice";
import { Confirm } from "./Confirm";
import { Box, Group, Loader } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

export const Account = ({
  data,
  isLoading,
  refresh,
}: {
  data: any;
  isLoading: boolean;
  refresh: () => void;
}) => {
  const token = useAppSelector(selectToken);
  const [moveFunds, { isLoading: il }] = useTranferSoltoMasterMutation();

  console.log(data);
  return (
    <>
      <Group mt={10} mb={10} justify="space-between">
        <Group>
          <Confirm
            text="Are you sure you want to move all the funds to the master wallet?"
            buttonText="Move All Sol to Master Wallet"
            isLoading={il}
            confirm={async () => {
              await moveFunds({
                mode: token.mode,
                symbol: token.symbol,
              });
              refresh();
              notifications.show({
                title: "Transaction Complete",
                message: "The Transcation has Completed!",
              });
            }}
          />
        </Group>
        <IconRefresh
          onClick={() => {
            refresh();
          }}
          color="rgb(25, 113, 194)"
        />
      </Group>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {data && (
            <>
              <Box>
                Account: <strong>{data.wallet}</strong>
              </Box>
              <Box>
                Sol: <strong>{data.sol}</strong>
              </Box>
              <Box>
                Token: <strong>{data.tokenBalance}</strong>
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
