import { getTopicLabel, TopicEvaluationResultModel } from '@/api/topic';
import { ResultCard } from '@/components/visual/result-card';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack, Group, Title, Text, Select } from '@mantine/core';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { extractTopicCustomdataForPlotly } from '../topics/results/topics/utils';
import { zip } from 'lodash-es';
import { useTopicAppState } from '../topics/app-state';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

interface TopicEvaluationResultRendererProps
  extends TopicEvaluationResultModel {
  column: string;
}

enum TopicEvaluationDataMode {
  CoherenceV = 'coherence_v',
  Frequency = 'frequency',
  SilhouetteScore = 'silhouette_score',
}

const TOPIC_EVALUATION_DATA_MODE_DICTIONARY = {
  [TopicEvaluationDataMode.CoherenceV]: {
    label: 'Topic Coherence',
    value: TopicEvaluationDataMode.CoherenceV,
    description:
      'Do the topic words of this topic make sense with each other, given the word co-occurrence in the corpus? Higher value is better.',
  },
  [TopicEvaluationDataMode.SilhouetteScore]: {
    label: 'Silhouette Score',
    value: TopicEvaluationDataMode.SilhouetteScore,
    description:
      'Does the document clustering make sense? Documents in the same topic should have their document vectors organized near each other, and while documents in different topics should have their document vectors organized far away from each other.',
  },
  [TopicEvaluationDataMode.Frequency]: {
    label: 'Frequency',
    value: TopicEvaluationDataMode.Frequency,
    description: 'The frequency of the documents assigned to the topic.',
  },
};

function IndividualTopicEvaluationBarChart(
  props: TopicEvaluationResultRendererProps,
) {
  const { topics: topicEvaluations, column } = props;
  const [mode, setMode] = React.useState(TopicEvaluationDataMode.CoherenceV);
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!mode) return undefined;
    const coherence_v_per_topic = topicEvaluations.map(
      (evaluation) => evaluation.coherence.coherence,
    );
    const silhouette_score_per_topic = topicEvaluations.map(
      (evaluation) => evaluation.silhouette_score,
    );
    const frequencies = topicEvaluations.map(
      (evaluation) => evaluation.topic.frequency,
    );
    let x: number[];
    if (mode === TopicEvaluationDataMode.CoherenceV) {
      x = coherence_v_per_topic;
    } else if (mode === TopicEvaluationDataMode.SilhouetteScore) {
      x = silhouette_score_per_topic;
    } else if (mode === TopicEvaluationDataMode.Frequency) {
      x = frequencies;
    } else {
      x = coherence_v_per_topic;
    }
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
    const hovertemplateIdx = topicsCustomdata.length;
    const customdata = zip<any>(
      ...topicsCustomdata,
      coherence_v_per_topic,
      silhouette_score_per_topic,
    ) as string[][];
    return {
      data: [
        {
          x,
          y,
          marker: {
            color: colors,
          },
          customdata,
          hovertemplate: [
            topicsHovertemplate,
            `<b>Coherence</b>: %{customdata[${hovertemplateIdx}]}`,
            `<b>Silhouette Score</b>: %{customdata[${hovertemplateIdx + 1}]}`,
          ].join('<br>'),
          error_x:
            mode === TopicEvaluationDataMode.CoherenceV
              ? {
                  type: 'data',
                  array: error_x,
                  visible: true,
                }
              : undefined,
          type: 'bar',
          orientation: 'h',
        },
      ],
      layout: {
        title: `Coherence per Topics of ${column}`,
        xaxis: {
          automargin: true,
          minallowed:
            mode === TopicEvaluationDataMode.SilhouetteScore ? undefined : 0,
          range:
            mode === TopicEvaluationDataMode.SilhouetteScore
              ? [-1, 1]
              : mode === TopicEvaluationDataMode.CoherenceV
                ? [0, 1]
                : undefined,
          title: 'Coherence',
        },
        yaxis: {
          automargin: true,
          title: 'Topics',
        },
      },
    };
  }, [mode, topicEvaluations, column]);

  const renderOption = useDescriptionBasedRenderOption(
    TOPIC_EVALUATION_DATA_MODE_DICTIONARY,
  );
  return (
    <Stack className="w-full">
      <Select
        value={mode}
        onChange={
          setMode as React.Dispatch<React.SetStateAction<string | null>>
        }
        label="Mode"
        description="Choose the data to be visualized"
        required
        data={Object.values(TOPIC_EVALUATION_DATA_MODE_DICTIONARY)}
        renderOption={renderOption}
      />
      {plot && <PlotRenderer plot={plot} />}
    </Stack>
  );
}

export function TopicEvaluationMetricsRenderer(
  props: TopicEvaluationResultModel,
) {
  const {
    coherence_v,
    topics,
    silhouette_score,
    topic_diversity,
    outlier_count,
    total_count,
  } = props;
  return (
    <Group justify="space-around" pt={16}>
      <ResultCard
        label="Topic Coherence"
        value={coherence_v.toFixed(4)}
        info="A score that represents how coherent the topics are. A higher score is better. A topic is considered coherent if its topic words represent the contents of the documents assigned to that topic well."
      />
      <ResultCard
        label="Topic Diversity"
        value={topic_diversity.toFixed(4)}
        info="A score that represents how diverse the topics are. A higher score (max is 1.0) is better. The topics are considered diverse if there's little overlap in the topic words used to represent each topic."
      />
      <ResultCard
        label="Topic Count"
        value={topics.length.toString()}
        info="A score that represents how diverse the topics are. A higher score (max is 1.0) is better. The topics are considered diverse if there's little overlap in the topic words used to represent each topic."
      />
      <ResultCard
        label="Silhouette Score"
        value={silhouette_score.toFixed(4)}
        info="A score that represents the quality of the document clustering. A higher score (max is 1.0) represent a sensible clustering, while a negative score (min is -1.0) represent an incoherent clustering."
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
