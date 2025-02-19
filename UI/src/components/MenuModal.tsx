/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export const MenuModal = ({
  menu,
  theme = {
    w: "auto",
    bg: "gray",
    variant: "default",
    c: "white",
  },
  closeIt,
}: {
  menu: any;
  theme?: any;
  closeIt: (cl: any) => void;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  closeIt(close);
  return (
    <>
      <Button
        size="xs"
        onClick={() => open()}
        variant={theme.variant}
        bg={theme.bg}
        w={theme.w}
        c={theme.c}
      >
        Actions
      </Button>
      <Modal opened={opened} onClose={close} title="Withdraw from pool">
        {menu}
      </Modal>
    </>
  );
};
