import {
  BERTopicExperimentResultModel,
  BERTopicExperimentTrialResultModel,
  TopicEvaluationResultModel,
} from '@/api/topic';
import { ActionIcon, Badge, Stack, Text, Title } from '@mantine/core';
import { useTopicModelExperimentStatusQuery } from '../app-state';
import React from 'react';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import TopicModelExperimentResultTopicsModal from './details/modal';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import { TopicModelExperimentLoadingNotification } from './component/loading';
import { Eye } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { max } from 'lodash-es';
import { TopicEvaluationMetricsRenderer } from '@/modules/topic-evaluation/result';

interface TopicModelExperimentDetailsProps {
  data: BERTopicExperimentResultModel;
}

function TopicModelExperimentDetails(props: TopicModelExperimentDetailsProps) {
  const { data } = props;

  const trialRemote =
    React.useRef<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null>(
      null,
    );

  const maxTopicsCount = React.useMemo(() => {
    return (
      max(
        data.trials
          .map((trial) => trial.evaluation?.topics.length)
          .filter((topicCount) => topicCount != null),
      ) ?? 1
    );
  }, [data.trials]);
  const maxOutlierCount = React.useMemo(() => {
    return (
      max(
        data.trials
          .map((trial) => trial.evaluation?.outlier_count)
          .filter((topicCount) => topicCount != null),
      ) ?? 0
    );
  }, [data.trials]);

  const columns = React.useMemo<
    MRT_ColumnDef<BERTopicExperimentTrialResultModel>[]
  >(() => {
    const hyperparameterColumns: MRT_ColumnDef<BERTopicExperimentTrialResultModel>[] =
      [];
    if (data.constraint.max_topics != null) {
      hyperparameterColumns.push({
        header: 'Max. Topics',
        accessorKey: 'candidate.max_topics',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: data.constraint.max_topics[0],
          max: data.constraint.max_topics[1],
        },
      });
    }
    if (data.constraint.min_topic_size != null) {
      hyperparameterColumns.push({
        header: 'Min. Topic Size',
        accessorKey: 'candidate.min_topic_size',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: data.constraint.min_topic_size[0],
          max: data.constraint.min_topic_size[1],
        },
      });
    }
    if (data.constraint.topic_confidence_threshold != null) {
      hyperparameterColumns.push({
        header: 'Topic Confidence Threshold',
        accessorKey: 'candidate.topic_confidence_threshold',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: data.constraint.topic_confidence_threshold[0],
          max: data.constraint.topic_confidence_threshold[1],
        },
      });
    }
    return [
      {
        header: 'Trial',
        accessorKey: 'trial_number',
        filterVariant: 'range-slider',
        filterFn: 'inNumberRange',
        sortUndefined: 'last',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: 1,
          max: data.trials.length,
        },
      },
      {
        header: 'Timestamp',
        enableColumnFilter: false,
        sortUndefined: 'last',
        accessorFn(original) {
          const date = dayjs(original.timestamp);
          if (date.isValid()) return date;
          else return null;
        },
        Cell({ cell: { getValue } }) {
          const date = getValue() as Date;
          return dayjs(date).format('DD MMMM YYYY, HH:mm:ss');
        },
      },
      {
        header: 'Status',
        id: 'status',
        filterVariant: 'select',
        mantineFilterSelectProps: {
          data: ['Success', 'Failed'],
        },
        accessorFn(original) {
          return !!original.evaluation ? 'Success' : 'Failed';
        },
        Cell(props) {
          const original = props.row.original;
          if (original.evaluation) {
            return <Badge color="green">Success</Badge>;
          } else {
            return <Badge color="red">Failed</Badge>;
          }
        },
      },
      ...hyperparameterColumns,
      {
        header: 'Topic Coherence',
        accessorKey: 'evaluation.coherence_v',
        filterVariant: 'range-slider',
        filterFn: 'inNumberRange',
        sortUndefined: 'last',
        mantineFilterRangeSliderProps: {
          step: 0.01,
          min: 0,
          max: 1,
          minRange: 0.01,
        },
        Cell({ cell: { getValue } }) {
          const coherence = getValue() as number | undefined;
          return coherence?.toFixed(3);
        },
      },
      {
        header: 'Topic Diversity',
        accessorKey: 'evaluation.topic_diversity',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        sortUndefined: 'last',
        mantineFilterRangeSliderProps: {
          step: 0.01,
          min: 0,
          max: 1,
          minRange: 0.01,
        },
        Cell({ cell: { getValue } }) {
          const diversity = getValue() as number | undefined;
          return diversity?.toFixed(3);
        },
      },
      {
        header: 'Topic Count',
        key: 'topic_count',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        sortUndefined: 'last',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: 1,
          max: maxTopicsCount,
        },
        accessorFn(originalRow) {
          return originalRow.evaluation?.topics.length;
        },
      },
      {
        header: 'Outlier Frequency',
        accessorKey: 'evaluation.outlier_count',
        filterVariant: 'range-slider',
        filterFn: 'betweenInclusive',
        sortUndefined: 'last',
        mantineFilterRangeSliderProps: {
          minRange: 1,
          min: 0,
          max: maxOutlierCount,
        },
      },
      {
        header: '',
        id: 'action',
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        enablePinning: true,
        accessorFn() {
          return undefined;
        },
        Cell({ row: { original } }) {
          return (
            <ActionIcon
              color="brand"
              onClick={() => {
                trialRemote.current?.open(original);
              }}
              variant="subtle"
            >
              <Eye size={24} />
            </ActionIcon>
          );
        },
      },
    ];
  }, [
    data.constraint.max_topics,
    data.constraint.min_topic_size,
    data.constraint.topic_confidence_threshold,
    data.trials.length,
    maxOutlierCount,
    maxTopicsCount,
  ]);

  const table = useMantineReactTable({
    data: data.trials,
    columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(data.trials, []),
    columnFilterDisplayMode: 'subheader',
    enableFilters: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableMultiSort: true,
    enablePagination: true,
    sortDescFirst: false,
  });

  return (
    <>
      <Title order={2}>Topic Experiment Results</Title>
      <TopicModelExperimentResultTopicsModal ref={trialRemote} />
      <div className="h-full">
        <MantineReactTable table={table} />
      </div>
    </>
  );
}

function TopicEvaluationOfCurrentTopicModel(props: TopicEvaluationResultModel) {
  return (
    <Stack>
      <div>
        <Title order={2}>Current Topic Evaluation</Title>
        <Text c="gray">
          The evaluation metrics for the results of the current topic model.
          Compare the metrics with the evaluation metrics of the trial results
          to choose which hyperparameters you&apos;d rather use.
        </Text>
      </div>
      <TopicEvaluationMetricsRenderer {...props} />
    </Stack>
  );
}

export default function TopicModelExperimentDetailsTab() {
  const { query, isStillPolling } = useTopicModelExperimentStatusQuery();
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent query={query} isLoading={query.isLoading}>
      <Stack gap={32}>
        {data?.evaluation && (
          <TopicEvaluationOfCurrentTopicModel {...data.evaluation} />
        )}
        {data && <TopicModelExperimentDetails data={data} />}
        <TopicModelExperimentLoadingNotification
          data={data}
          isStillPolling={isStillPolling}
        />
      </Stack>
    </UseQueryWrapperComponent>
  );
}
