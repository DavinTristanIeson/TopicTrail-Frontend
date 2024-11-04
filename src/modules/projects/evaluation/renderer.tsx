import { TopicEvaluationModel } from "@/api/evaluation/model";
import PlotRenderer from "../common/plots";
import { Alert, Group, Paper, Stack, Title } from "@mantine/core";
import React from "react";
import Colors from "@/common/constants/colors";
import { Info } from "@phosphor-icons/react";
import Text from "@/components/standard/text";
import { SupplementaryInfoField } from "../common/table";

export default function TopicEvaluationRenderer(props: TopicEvaluationModel) {
  return (
    <Stack>
      <Paper shadow="sm" p={16}>
        <Alert color={Colors.sentimentInfo}>
          <Group align="center" wrap="nowrap">
            <Info size={36} />
            <Stack>
              <Text>
                <Text fw="bold" span>
                  Topic coherence
                </Text>{" "}
                is a quantitative measure of the interpretability of a topic.
                They assess how well the words that make up a topic is supported
                by the actual documents. The metric of topic coherence used in
                this evaluation is C_V scoring. Generally, C_v scores higher
                than 0.55 can be considered acceptably coherent while scores
                less than 0.4 is low, but this varies from dataset to dataset.
                Higher C_v scores indicate more coherent topics. If you keep on
                getting low C_V scores, consider setting a maximum number of
                topics to constrain the number of topics. The low scores may
                have been caused by the small topics discovered by the topic
                modeling algorithm.
              </Text>
              <Text>
                On the other hand,{" "}
                <Text fw="bold" span>
                  topic diversity
                </Text>{" "}
                measures the overlap between the keywords of the discovered
                topics. A high topic diversity value (nearing 1) indicates that
                the words used to describe the topics have little overlap with
                one another and so they discriminate the topics more clearly.
                Topic diversity ranges from 0 to 1, with 0 being least diverse
                and 1 being most diverse.
              </Text>
              <Text>
                Use this metric to figure out how much you can trust the topics
                discovered by the topic modeling algorithm.
              </Text>
            </Stack>
          </Group>
        </Alert>
        <Group justify="space-around" pt={16}>
          <SupplementaryInfoField
            label="Topic Coherence"
            value={props.cvScore.toFixed(4)}
          />
          <SupplementaryInfoField
            label="Topic Diversity"
            value={props.topicDiversityScore.toFixed(4)}
          />
        </Group>
        <Title order={3} ta="center" pt={32}>
          Coherence Scores per Topic
        </Title>
        <PlotRenderer plot={props.cvBarchart} />
      </Paper>
    </Stack>
  );
}
