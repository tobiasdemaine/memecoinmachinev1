import { Button, Modal, NumberInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

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
        <NumberInput
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Withdraw Amount"
          placeholder="Enter amount"
        />

        {withdrawAmount && withdrawAmount <= maxAmount && (
          <Button
            mt={10}
            onClick={async () => {
              confirm(withdrawAmount);
              close();
            }}
            loading={isLoading}
            loaderProps={{ type: "dots" }}
          >
            Withdraw from pool
          </Button>
        )}
      </Modal>
    </>
  );
};
