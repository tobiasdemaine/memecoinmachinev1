import { AppShell, Group, NavLink, Burger, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconCoin,
  IconCoins,
  IconDashboard,
  IconOutbound,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
//import { useAppDispatch, useAppSelector } from "./redux/hooks";
//import { selectToken } from "./redux/tokenSlice";
import { Router } from "./Router";
import { useAppSelector } from "./redux/hooks";
import { selectToken } from "./redux/tokenSlice";

export const Shell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 170,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

          <Box>
            {window.location.pathname === "/tokens"
              ? "Tokens"
              : window.location.pathname === "/new"
              ? "New"
              : window.location.pathname === "/"
              ? "Dashboard"
              : window.location.pathname === "/withdraw"
              ? "Withdraw"
              : `${token.mode} ${token.symbol}`}
          </Box>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          leftSection={<IconDashboard size="1rem" stroke={1.5} />}
          onClick={() => {
            navigate("/");
            close();
          }}
          label="Dashboard"
        />

        <NavLink
          leftSection={<IconCoin size="1rem" stroke={1.5} />}
          onClick={() => {
            navigate("/new");
            close();
          }}
          label="New Token"
        />

        <NavLink
          leftSection={<IconCoins size="1rem" stroke={1.5} />}
          onClick={() => {
            navigate("/tokens");
            close();
          }}
          label="Tokens"
        />

        <NavLink
          leftSection={<IconOutbound size="1rem" stroke={1.5} />}
          onClick={() => {
            navigate("/withdraw");
            close();
          }}
          label="Withdraw"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Router />
      </AppShell.Main>
    </AppShell>
  );
};
