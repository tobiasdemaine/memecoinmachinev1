import { Button, Group, Title } from "@mantine/core";
import {
  useNewTokenStep2Mutation,
  useRegenerateSiteMutation,
} from "../redux/services/backofficeAPI";
import { Confirm } from "./Confirm";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectToken, setToken } from "../redux/tokenSlice";
import { githubDarkTheme, JsonEditor } from "json-edit-react";
import { useState } from "react";

export const NewStep2Website = () => {
  const [previewSite, { isLoading: isLoading }] = useRegenerateSiteMutation();
  const [finish, { isLoading: il }] = useNewTokenStep2Mutation();
  const token = useAppSelector(selectToken);
  const [website, setWebsite] = useState(token.data.website);
  const dispatch = useAppDispatch();
  return (
    <>
      <Title order={3}>New Step 2 : Website</Title>
      <Group mt={20} mb={20} justify="space-between">
        <Button
          loading={isLoading}
          loaderProps={{ type: "dots" }}
          onClick={async () => {
            await previewSite({
              symbol: token.symbol,
              mode: token.mode,
              json: website,
            });
          }}
        >
          Preview Website
        </Button>
        <Confirm
          text="Are you sure you continue?"
          buttonText="Publish Website, Market and Liquidity Pool"
          isLoading={il}
          confirm={async () => {
            await finish({
              mode: token.mode,
              symbol: token.symbol,
              data: { ...token.data, website },
            });
            dispatch(
              setToken({
                mode: token.mode,
                symbol: token.symbol,
                data: { ...token.data, website },
              })
            );
            notifications.show({
              title: "Publishing",
              message: "Publish Website, Market and Liquidity Pool",
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
