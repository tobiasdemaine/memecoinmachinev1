/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Group, Loader, Modal } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { useState } from "react";
import { NumberInput } from "@mantine/core";
import { useWithdrawLiquidityMutation } from "../redux/services/backofficeAPI";
import { notifications } from "@mantine/notifications";

export const Pool = ({
  watchdata,
  isLoading,
  refresh,
  mode,
  symbol,
}: {
  watchdata: any;
  refresh: () => void;
  isLoading: boolean;
  mode: string;
  symbol: string;
}) => {
  const [withdraw, { isLoading: il }] = useWithdrawLiquidityMutation();
  const { width } = useViewportSize();
  const [opened, { open, close }] = useDisclosure(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );

  const calculatePercentage = (amount: number | undefined) => {
    if (!amount || !watchdata) return 0;
    return (amount / watchdata.myPoolLPBalance) * 100;
  };

  const calculateAmountInAUD = (amount: number | undefined) => {
    if (!amount || !watchdata) return 0;

    return calculateAmountInSOL(amount) * watchdata.SOL_AUD;
  };

  const calculateAmountInSOL = (amount: number | undefined) => {
    if (!amount || !watchdata) return 0;
    return (
      (((watchdata.poolSolBalance / 100) * watchdata.ownershipPercent) / 100) *
      calculatePercentage(amount)
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Withdraw from pool"
        withinPortal={false}
        style={{ marginLeft: width < 768 ? -15 : -185 }}
      >
        <NumberInput
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Withdraw Amount"
          placeholder="Enter amount"
        />
        <Box mt={10}>
          % My LP Balance:{" "}
          <b>{calculatePercentage(withdrawAmount).toFixed(2)}%</b>
        </Box>
        <Box mt={10}>
          Amount in AUD:{" "}
          <b>{calculateAmountInAUD(withdrawAmount).toFixed(2)}</b>
        </Box>
        <Box mt={10}>
          Amount in SOL:{" "}
          <b>{calculateAmountInSOL(withdrawAmount).toFixed(2)}</b>
        </Box>
        {calculatePercentage(withdrawAmount) <= 100 && (
          <Button
            mt={10}
            onClick={async () => {
              await withdraw({
                mode,
                symbol,
                amount: withdrawAmount,
              });
              close();
              notifications.show({
                title: "Transaction Complete",
                message: "The Transcation has Completed!",
              });
              refresh();
            }}
            loading={il}
            loaderProps={{ type: "dots" }}
          >
            Withdraw from pool
          </Button>
        )}
      </Modal>
      <Group justify="space-between" pb={5}>
        <Button size="xs" onClick={open}>
          Withdraw from Pool
        </Button>

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
          {watchdata && (
            <>
              <Box>
                Total Pool: <b>{watchdata.totalPool}</b>
              </Box>
              <Box>
                Burn Amount: <b>{watchdata.burnAmt}</b>
              </Box>
              <Box>
                LP Burned: <b>{watchdata.lpBurned}</b>
              </Box>
              <Box>
                My Pool LP Balance: <b>{watchdata.myPoolLPBalance}</b>
              </Box>
              <Box>
                Ownership Percent: <b>{watchdata.ownershipPercent}</b>
              </Box>
              <Box>
                Pool Balance: <b>{watchdata.poolBalance}</b>
              </Box>
              <Box>
                Pool SOL Balance: <b>{watchdata.poolSolBalance}</b>
              </Box>
              <Box>
                Token SOL: <b>{watchdata.token_SOL}</b>
              </Box>
              <Box>
                Token AUD: <b>{watchdata.token_AUD}</b>
              </Box>
              <Box>
                SOL to AUD: <b>{watchdata.SOL_AUD}</b>
              </Box>
              <Box>
                Pool SOL as AUD: <b>{watchdata.poolSOLasAUD}</b>
              </Box>
              <Box>
                Share Pool SOL as AUD: <b>{watchdata.sharePoolSolasAUD}</b>
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
