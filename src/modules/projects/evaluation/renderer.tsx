import { TopicEvaluationModel } from "@/api/evaluation/model";
import PlotRenderer from "../common/plots";
import { Alert, Group, Paper, Select, Stack, Title } from "@mantine/core";
import React from "react";
import Colors from "@/common/constants/colors";
import { Info } from "@phosphor-icons/react";
import Text from "@/components/standard/text";
import { SupplementaryInfoField } from "../common/table";

export default function TopicEvaluationRenderer(props: TopicEvaluationModel) {
  return (
    <Stack>
      <Alert color={Colors.sentimentInfo}>
        <Group>
          <Info />
          <div>
            <Text>
              Topic coherence is a quantitative measure of the interpretability
              of a topic. They assess how well the words that make up a topic is
              supported by the actual documents. The metric of topic coherence
              used in this evaluation is C_V scoring. Generally, C_v scores
              higher than 0.55 can be considered acceptably coherent, but this
              varies from dataset to dataset. Higher C_v scores indicate more
              coherent topics.
            </Text>
            <Text>
              On the other hand, topic diversity measures the overlap between
              the keywords of the discovered topics. A high topic diversity
              value indicates that the words used to describe the topics have
              little overlap with one another and so they discriminate the
              topics more clearly.
            </Text>
          </div>
        </Group>
      </Alert>
      <Paper shadow="sm">
        <Group justify="space-around">
          <SupplementaryInfoField
            label="Topic Coherence"
            value={props.cvScore.toFixed(4)}
          />
          <SupplementaryInfoField
            label="Topic Diversity"
            value={props.topicDiversityScore.toFixed(4)}
          />
        </Group>
      </Paper>
      <Paper>
        <Title order={3}>Coherence Scores per Topic</Title>
        <PlotRenderer plot={props.cvBarchart} />
      </Paper>
    </Stack>
  );
}
