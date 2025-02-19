/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export const Confirm = ({
  text,
  confirm,
  buttonText,
  isLoading = false,
  theme = {
    w: "auto",
    bg: "gray",
    variant: "default",
    c: "white",
  },
}: {
  text: string;
  confirm: () => void;
  buttonText: string;
  isLoading?: boolean;
  theme?: any;
}) => {
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
              bg={theme.bg}
              c={theme.c}
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
              bg={theme.bg}
              c={theme.c}
            >
              Ok
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
