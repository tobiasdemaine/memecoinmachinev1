import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
//import { theme } from './theme';
import { store } from "./redux/store";
import { Shell } from "./Shell";

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications />
          <BrowserRouter>
            <Shell />
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  );
}
