import { ProjectModel } from "@/api/project/model";
import AppProjectLayout from "@/modules/projects/common/layout";
import { Table } from "@mantine/core";

function ProjectTablePageBody(props: ProjectModel) {
  return (
    <Table highlightOnHover={true} border={1} borderColor="black">
      <Table.Thead>
        <Table.Tr>
          <Table.Th className="text-center">Index</Table.Th>
          <Table.Th className="w-44 text-center">Name</Table.Th>
          <Table.Th className="w-44 text-center">Area</Table.Th>
          <Table.Th className="text-center">Review Date</Table.Th>
          <Table.Th className="w-44 text-center">Rating Attribute</Table.Th>
          <Table.Th className="text-center">Rating</Table.Th>
          <Table.Th className="text-center">Review Text</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td className="text-center">1</Table.Td>
          <Table.Td>Hotel The Pearl</Table.Td>
          <Table.Td>Paharganj, New Delhi</Table.Td>
          <Table.Td className="text-center">Jul-23</Table.Td>
          <Table.Td>Best budget friendly hotel</Table.Td>
          <Table.Td className="text-center">9.0</Table.Td>
          <Table.Td>place delhi paharganj whole staff helpful comfortable hotels convinient Truly wonderful recommended</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table >
  );
}

export default function ProjectTablePage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectTablePageBody {...project} />}
    </AppProjectLayout>
  );
}
