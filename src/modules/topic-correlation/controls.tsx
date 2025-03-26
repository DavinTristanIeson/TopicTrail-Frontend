import React from 'react';
import { ProjectContext } from '../project/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { ProjectColumnSelectInput } from '../project/select-column-input';
import { Group, Card, Text, Divider, Title } from '@mantine/core';
import { SchemaColumnModel } from '@/api/project';
import { AllTopicModelingResultContext } from '../topics/components/context';

interface TopicCorrelationColumnControlsProps {
  column1: SchemaColumnModel | null;
  column2: SchemaColumnModel | null;
  setColumn1: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
  setColumn2: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
}

export default function TopicCorrelationColumnControls(
  props: TopicCorrelationColumnControlsProps,
) {
  const { column1, column2, setColumn1, setColumn2 } = props;
  const project = React.useContext(ProjectContext);
  const topicColumns = React.useContext(AllTopicModelingResultContext)
    .filter((topic) => !!topic.result)
    .map((topicModelingResult) => topicModelingResult.column);
  const supportedOtherColumns = project.config.data_schema.columns.filter(
    // Don't include topic columns
    (column) => column.type !== SchemaColumnTypeEnum.Topic,
  );

  return (
    <Card withBorder shadow="lg" p="lg" radius="lg" style={{ backgroundColor: 'white', borderLeft: '5px solid #7a84b9' }}>
      <Title order={2} c="brand">Topic Correlation Analysis</Title>
      <Divider my="sm" size="sm" color="#7a84b9"/>
      <Text size="sm">
        Understanding the correlation between discovered topics and other dataset variables can provide valuable insights. 
        This analysis helps in identifying patterns, trends, and potential influencing factors, which can be useful for 
        decision-making and deeper data interpretation.
      </Text>
      <Group align="start" mt="md">
        <ProjectColumnSelectInput
          data={topicColumns}
          value={column1?.name ?? null}
          onChange={setColumn1}
          label="Column 1"
          description="Select a textual column whose topics will be used in the analysis. If you cannot find a textual column in the dropdown list, it is likely that you haven't run the topic modeling algorithm on that column yet."
          className="flex-1"
        />
        <ProjectColumnSelectInput
          data={supportedOtherColumns}
          label="Column 2"
          value={column2?.name ?? null}
          onChange={setColumn2}
          className="flex-1"
        />
      </Group>
    </Card>
  );
}
