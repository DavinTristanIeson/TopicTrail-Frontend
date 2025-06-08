import { getTopicLabel, TopicEvaluationResultModel } from '@/api/topic';
import { ResultCard } from '@/components/visual/result-card';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack, Group, Title, Text } from '@mantine/core';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { extractTopicCustomdataForPlotly } from '../topics/results/topics/utils';
import { zip } from 'lodash-es';
import { useTopicAppState } from '../topics/app-state';

interface TopicEvaluationResultRendererProps
  extends TopicEvaluationResultModel {
  column: string;
}

function IndividualTopicEvaluationBarChart(
  props: TopicEvaluationResultRendererProps,
) {
  const { topics: topicEvaluations, column } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const coherence_v_per_topic = topicEvaluations.map(
      (evaluation) => evaluation.coherence.coherence,
    );
    const x = coherence_v_per_topic;
    const y = topicEvaluations.map((evaluation) =>
      getTopicLabel(evaluation.topic),
    );
    const topics = topicEvaluations.map((evaluation) => evaluation.topic);
    const error_x = topicEvaluations.map(
      (evaluation) => evaluation.coherence.std_dev,
    );
    const { colors } = generateColorsFromSequence(y);
    const { customdata: topicsCustomdata, hovertemplate: topicsHovertemplate } =
      extractTopicCustomdataForPlotly({
        topics,
      });
    const customdata = zip<any>(...topicsCustomdata) as string[][];
    return {
      data: [
        {
          x,
          y,
          marker: {
            color: colors,
          },
          customdata,
          hovertemplate: [topicsHovertemplate, `<b>Coherence</b>: %{x}`].join(
            '<br>',
          ),
          error_x: {
            type: 'data',
            array: error_x,
            visible: true,
          },
          type: 'bar',
          orientation: 'h',
        },
      ],
      layout: {
        title: `Coherence per Topics of ${column}`,
        xaxis: {
          automargin: true,
          minallowed: 0,
          range: [0, 1],
          title: 'Coherence',
        },
        yaxis: {
          automargin: true,
          title: 'Topics',
        },
      },
    } as PlotParams;
  }, [topicEvaluations, column]);

  return <PlotRenderer plot={plot} />;
}

export function TopicEvaluationMetricsRenderer(
  props: TopicEvaluationResultModel,
) {
  const { coherence_v, topics, topic_diversity, outlier_count, total_count } =
    props;
  return (
    <Group justify="space-around" pt={16}>
      <ResultCard
        label="Topic Coherence"
        value={coherence_v}
        info="A score that represents how coherent the topics are. A higher score is better. A topic is considered coherent if its topic words represent the contents of the documents assigned to that topic well."
      />
      <ResultCard
        label="Topic Diversity"
        value={topic_diversity}
        info="A score that represents how diverse the topics are. A higher score (max is 1.0) is better. The topics are considered diverse if there's little overlap in the topic words used to represent each topic."
      />
      <ResultCard
        label="Topic Count"
        value={topics.length}
        info="A score that represents how diverse the topics are. A higher score (max is 1.0) is better. The topics are considered diverse if there's little overlap in the topic words used to represent each topic."
      />
      <ResultCard
        label="Outlier Frequency"
        value={
          <Text inherit>
            <Text span inherit c="red">
              {outlier_count}
            </Text>
            /{total_count}
          </Text>
        }
        info="The number of rows that are classified as outliers."
      />
    </Group>
  );
}

export function TopicEvaluationResultRenderer(
  props: TopicEvaluationResultRendererProps,
) {
  const { column } = props;
  return (
    <Stack className="pt-5">
      <Title order={2} ta="center">
        Topic Evaluation Results of {column}
      </Title>
      <TopicEvaluationMetricsRenderer {...props} />
      <IndividualTopicEvaluationBarChart {...props} />
    </Stack>
  );
}

interface TopicEvaluationResultComponentProps {
  data: TopicEvaluationResultModel;
}

export default function TopicEvaluationResultComponent(
  props: TopicEvaluationResultComponentProps,
) {
  const { data } = props;
  const column = useTopicAppState((store) => store.column!);
  return (
    <TopicEvaluationResultRenderer
      column={column?.name ?? 'Column'}
      {...data}
    />
  );
}
