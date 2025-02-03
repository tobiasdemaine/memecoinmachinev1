import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
/* import "@mantine/dates/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/charts/styles.css";
 */
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import { theme } from "./theme";
import { Home } from "./home";

//const PORTIS_DAPP_ID = '';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications />
        <Home />
      </ModalsProvider>
    </MantineProvider>
  );
}
