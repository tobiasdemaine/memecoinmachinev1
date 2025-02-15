import { Card, SimpleGrid } from "@mantine/core";

export const DashboardPage = () => {
  console.log(".");
  return (
    <>
      <SimpleGrid cols={3}>
        <Card>Deposit monies to adress : XXXXXXX</Card>
        <Card>Estimated Dev Net : XXXXXXX</Card>
        <Card>Estimated Main Net : XXXXXXX</Card>
      </SimpleGrid>
    </>
  );
};
