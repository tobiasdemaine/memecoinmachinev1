import { Card, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { Confirm } from "../components/Confirm";

export const WithdrawPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );

  const [withdrawAddress, setWithdrawAddress] = useState<string | undefined>(
    undefined
  );
  return (
    <>
      <Stack>
        <Card>Sol : available</Card>
        <TextInput
          value={withdrawAddress}
          onChange={(event) => setWithdrawAddress(event.currentTarget.value)}
          label="Withdraw Address"
          placeholder="Withdraw Address"
        />
        <NumberInput
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(Number(value))}
          label="Withdraw Amount"
          placeholder="Enter amount"
        />
        <Confirm
          text="Are you sure?"
          buttonText="Withdraw"
          confirm={() => {}}
        />
      </Stack>
    </>
  );
};
