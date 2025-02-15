import { Table } from "@mantine/core";
import { useAppSelector } from "../redux/hooks";
import { selectToken } from "../redux/tokenSlice";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const Audit = ({ data }: { data: any[] }) => {
  const token = useAppSelector(selectToken);
  console.log(data);
  const adata = [...data];
  console.log(typeof adata);
  adata.sort((a: any, b: any) => {
    if (a.address < b.address) return -1;
    if (a.address > b.address) return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  return (
    <>
      <Table mt={10}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Address</Table.Th>
            <Table.Th>SOL</Table.Th>
            <Table.Th>Token</Table.Th>
            <Table.Th>State</Table.Th>
            <Table.Th>Memo</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {adata &&
            adata.map((item: any) => (
              <Table.Tr key={item.date}>
                <Table.Th>{item.date}</Table.Th>
                <Table.Th>{item.address}</Table.Th>
                <Table.Th>{item.sol}</Table.Th>
                <Table.Th>{item[token.symbol]}</Table.Th>
                <Table.Th>{item.state}</Table.Th>
                <Table.Th>{item.memo}</Table.Th>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
