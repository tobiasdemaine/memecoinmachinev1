/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Group, Loader, Modal } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { NumberInput } from "@mantine/core";
import { useWithdrawLiquidityMutation } from "../redux/services/backofficeAPI";
import { notifications } from "@mantine/notifications";
import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/tokenSlice";

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
  const [opened, { open, close }] = useDisclosure(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );
  const token = useAppSelector(selectToken);
  const [watchData, setWatchData] = useState<any>();

  const saveData = (dataToSave: any) => {
    localStorage.setItem(
      `${token.mode}_${token.symbol}_pool`,
      JSON.stringify(dataToSave)
    );
  };

  const loadData = () => {
    const savedData = localStorage.getItem(
      `${token.mode}_${token.symbol}_pool`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
    return undefined;
  };

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
  useEffect(() => {
    const ld = loadData();
    console.log(ld, watchdata);
    if (ld && !watchdata) {
      setWatchData({ ...ld });
    }
    if (!ld && !watchdata) {
      setWatchData({});
    }

    if (watchdata) {
      if (Object.keys(watchdata).length > 0) {
        setWatchData({ ...watchdata });
        saveData({ ...watchdata });
      }
    }
  }, [watchdata, token]);
  //console.log(watchdata, watchData);
  return (
    <>
      <Modal opened={opened} onClose={close} title="Withdraw from pool">
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
            bg="gray"
          >
            Withdraw from pool
          </Button>
        )}
      </Modal>
      <Group justify="space-between" pb={5}>
        <Button size="xs" onClick={open} bg="gray">
          Withdraw from Pool
        </Button>

        {isLoading ? (
          <Loader color="grey" size={20} />
        ) : (
          <IconRefresh
            onClick={() => {
              refresh();
            }}
            color="grey"
          />
        )}
      </Group>
      {!watchData ? (
        <Loader color="grey" />
      ) : (
        <>
          {watchData && (
            <>
              <Box>
                Total Pool: <b>{watchData.totalPool}</b>
              </Box>
              <Box>
                Burn Amount: <b>{watchData.burnAmt}</b>
              </Box>
              <Box>
                LP Burned: <b>{watchData.lpBurned}</b>
              </Box>
              <Box>
                My Pool LP Balance: <b>{watchData.myPoolLPBalance}</b>
              </Box>
              <Box>
                Ownership Percent: <b>{watchData.ownershipPercent}</b>
              </Box>
              <Box>
                Pool Balance: <b>{watchData.poolBalance}</b>
              </Box>
              <Box>
                Pool SOL Balance: <b>{watchData.poolSolBalance}</b>
              </Box>
              <Box>
                Token SOL: <b>{watchData.token_SOL}</b>
              </Box>
              <Box>
                Token AUD: <b>{watchData.token_AUD}</b>
              </Box>
              <Box>
                SOL to AUD: <b>{watchData.SOL_AUD}</b>
              </Box>
              <Box>
                Pool SOL as AUD: <b>{watchData.poolSOLasAUD}</b>
              </Box>
              <Box>
                Share Pool SOL as AUD: <b>{watchData.sharePoolSolasAUD}</b>
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
