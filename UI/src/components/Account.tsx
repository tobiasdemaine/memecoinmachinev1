/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from "@mantine/notifications";
import { useAppSelector } from "../redux/hooks";
import { useTranferSoltoMasterMutation } from "../redux/services/backofficeAPI";
import { selectToken } from "../redux/tokenSlice";
import { Confirm } from "./Confirm";
import {
  ActionIcon,
  Box,
  CopyButton,
  Group,
  Loader,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";

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
                message: "The Transaction has Completed!",
              });
            }}
          />
        </Group>
        <IconRefresh
          onClick={() => {
            refresh();
          }}
          color="grey"
        />
      </Group>
      {isLoading ? (
        <Loader color="grey" />
      ) : (
        <>
          {data && (
            <>
              <Box>
                Account: <strong>{data.wallet}</strong>
                <CopyButton value={data.wallet} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? "Copied" : "Copy"}
                      withArrow
                      position="right"
                    >
                      <ActionIcon
                        color={copied ? "teal" : "gray"}
                        variant="subtle"
                        onClick={copy}
                      >
                        {copied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Box>
              <Box>
                Sol: <strong>{data.sol}</strong>
              </Box>
              <Box>
                {data.tokenBalance &&
                  data.tokenBalance.map((tb: any) => (
                    <Text key={tb.address}>
                      {tb.type}: <strong>{tb.amount}</strong>
                    </Text>
                  ))}
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
