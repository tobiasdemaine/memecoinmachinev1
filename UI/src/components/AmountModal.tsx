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
}: {
  text: string;
  confirm: (amount: number) => void;
  buttonText: string;
  isLoading?: boolean;
  maxAmount: number;
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
      >
        {buttonText}
      </Button>
      <Modal opened={opened} onClose={close} title="Withdraw from pool">
        <Text>{text}</Text>
        <Text>Max Spendable {maxAmount}</Text>
        <NumberInput
          mt={10}
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Withdraw Amount"
          placeholder="Enter amount"
          mb={10}
        />

        {withdrawAmount !== undefined &&
          withdrawAmount > 0 &&
          withdrawAmount <= maxAmount && (
            <Confirm
              text={`Are you sure you swap ${withdrawAmount} ?`}
              buttonText="Swap All Sol"
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
