import { Button, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export const Confirm = ({
  text,
  confirm,
  buttonText,
  isLoading = false,
}: {
  text: string;
  confirm: () => void;
  buttonText: string;
  isLoading?: boolean;
}) => {
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
      <Modal
        opened={opened}
        onClose={close}
        title="Are you sure?"
        withinPortal={true}
        style={{ left: 0 }}
      >
        <Stack>
          {text}
          <Group justify="space-between">
            <Button
              loading={isLoading}
              loaderProps={{ type: "dots" }}
              onClick={() => close()}
            >
              Cancel
            </Button>
            <Button
              loading={isLoading}
              loaderProps={{ type: "dots" }}
              onClick={() => {
                confirm();
                close();
              }}
            >
              Ok
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
