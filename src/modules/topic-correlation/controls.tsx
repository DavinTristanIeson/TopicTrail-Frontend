import React from 'react';
import { ProjectColumnSelectInput } from '../project/select-column-input';
import { Group, Card, Text, Divider, Title } from '@mantine/core';
import { SchemaColumnModel } from '@/api/project';
import { AllTopicModelingResultContext } from '../topics/components/context';

interface TopicCorrelationColumnControlsProps {
  column: SchemaColumnModel | null;
  setColumn: React.Dispatch<React.SetStateAction<SchemaColumnModel | null>>;
}

export default function TopicCorrelationColumnControls(
  props: TopicCorrelationColumnControlsProps,
) {
  const { column, setColumn } = props;
  const topicColumns = React.useContext(AllTopicModelingResultContext)
    .filter((topic) => !!topic.result)
    .map((topicModelingResult) => topicModelingResult.column);
  return (
    <Card
      withBorder
      p="lg"
      radius="lg"
      style={{ backgroundColor: 'white', borderLeft: '5px solid #7a84b9' }}
    >
      <Title order={2} c="brand">
        Topic Correlation Analysis
      </Title>
      <Divider my="sm" size="sm" color="#7a84b9" />
      <Text size="sm">
        Understanding the correlation between discovered topics and other
        dataset variables can provide valuable insights. This analysis helps in
        identifying patterns, trends, and potential influencing factors, which
        can be useful for decision-making and deeper data interpretation.
      </Text>
      <Group align="start" mt="md">
        <ProjectColumnSelectInput
          data={topicColumns}
          value={column?.name ?? null}
          onChange={setColumn}
          label="Column"
          description="Select a textual column whose topics will be used in the analysis. If you cannot find a textual column in the dropdown list, it is likely that you haven't run the topic modeling algorithm on that column yet."
          className="flex-1"
        />
      </Group>
    </Card>
  );
}
