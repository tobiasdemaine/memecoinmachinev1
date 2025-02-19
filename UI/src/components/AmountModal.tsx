/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, NumberInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { Confirm } from "./Confirm";

export const AmountModal = ({
  text,
  confirm,
  buttonText,
  isLoading = false,
  maxAmount,
  theme = {
    w: "auto",
    bg: "gray",
    variant: "default",
    c: "white",
  },
}: {
  text: string;
  confirm: (amount: number) => void;
  buttonText: string;
  isLoading?: boolean;
  maxAmount: number;
  theme?: any;
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Button
        size="xs"
        loading={isLoading}
        loaderProps={{ type: "dots" }}
        onClick={() => open()}
        variant={theme.variant}
        bg={theme.bg}
        w={theme.w}
        c={theme.c}
      >
        {buttonText}
      </Button>
      <Modal opened={opened} onClose={close} title="Amount">
        <Text>{text}</Text>
        <Text>Max Spendable {maxAmount}</Text>
        <NumberInput
          mt={10}
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Amount"
          placeholder="Enter amount"
          mb={10}
        />
        {withdrawAmount !== undefined &&
          withdrawAmount > 0 &&
          withdrawAmount <= Number(maxAmount) && (
            <Confirm
              text={`Are you sure you swap ${withdrawAmount} ?`}
              buttonText="GO "
              isLoading={isLoading}
              confirm={async () => {
                confirm(withdrawAmount);
                close();
              }}
            />
          )}
      </Modal>
    </>
  );
};
