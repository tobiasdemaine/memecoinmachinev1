import { Group } from "@mantine/core";
import {
  useRegenerateSiteMutation,
  useRepublishSiteMutation,
  useSaveJsonMutation,
} from "../redux/services/backofficeAPI";
import { Confirm } from "./Confirm";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import { githubDarkTheme, JsonEditor } from "json-edit-react";
import { useState } from "react";

export const Website = () => {
  const [regenerateSite, { isLoading: ilRegenerateSite }] =
    useRegenerateSiteMutation();
  const [republishSite, { isLoading: ilRepublishSite }] =
    useRepublishSiteMutation();
  const [saveJson, { isLoading: ilSaveJson }] = useSaveJsonMutation();
  const token = useAppSelector(selectToken);
  const [website, setWebsite] = useState(token.data.website);
  const dispatch = useAppDispatch();
  return (
    <>
      <Group mt={20} mb={20} justify="space-between">
        <Group>
          <Confirm
            text="Are you sure you want to regenerate this Website?"
            buttonText="Regenerate Site"
            isLoading={ilRegenerateSite}
            confirm={async () => {
              await regenerateSite({
                mode: token.mode,
                symbol: token.symbol,
              });
              notifications.show({
                title: "Regenerate Website",
                message: "Regeneration of Website Completed!",
              });
            }}
          />
          <Confirm
            text="Are you sure you want to republish this Website?"
            buttonText="Republish Site"
            isLoading={ilRepublishSite}
            confirm={async () => {
              await republishSite({
                mode: token.mode,
                symbol: token.symbol,
              });
              notifications.show({
                title: "Republish Website",
                message: "Republish Website Completed!",
              });
            }}
          />
        </Group>
        <Confirm
          text="Are you sure you Save?"
          buttonText="Save Website Data"
          isLoading={ilSaveJson}
          confirm={async () => {
            dispatch(
              setToken({
                mode: token.mode,
                symbol: token.symbol,
                data: { ...token.data, website },
              })
            );
            await saveJson({
              mode: token.mode,
              symbol: token.symbol,
              data: JSON.stringify({ ...token.data, website }),
            });
            notifications.show({
              title: "Website Data",
              message: "Website Data Saved!",
            });
          }}
        />
      </Group>
      <>
        <JsonEditor
          data={website}
          setData={setWebsite}
          theme={{
            ...githubDarkTheme,
            styles: {
              ...githubDarkTheme.styles,
              input: ["#FFFFFF", { fontSize: "90%" }],
            },
          }}
          maxWidth={"100%"}
        />
      </>
    </>
  );
};
