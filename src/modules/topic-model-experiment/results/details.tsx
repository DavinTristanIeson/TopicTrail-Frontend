import {
  BERTopicExperimentResultModel,
  BERTopicExperimentTrialResultModel,
} from '@/api/topic';
import {
  ActionIcon,
  Card,
  Pill,
  SimpleGrid,
  Stack,
  Switch,
} from '@mantine/core';
import {
  useTopicModelExperimentAppState,
  useTopicModelExperimentStatusQuery,
} from '../app-state';
import React from 'react';
import TopicModelExperimentResultSortByChoiceChips from './details/chip';
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

interface TopicModelExperimentDetailsProps {
  data: BERTopicExperimentResultModel;
}

function TopicModelExperimentDetails(props: TopicModelExperimentDetailsProps) {
  const { data } = props;
  const sortBy = useTopicModelExperimentAppState(
    (store) => store.details.sortBy,
  );
  const setSortBy = useTopicModelExperimentAppState(
    (store) => store.details.setSortBy,
  );
  const showFailed = useTopicModelExperimentAppState(
    (store) => store.details.showFailed,
  );
  const setShowFailed = useTopicModelExperimentAppState(
    (store) => store.details.setShowFailed,
  );

  const trialRemote =
    React.useRef<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null>(
      null,
    );

  const columns = React.useMemo<
    MRT_ColumnDef<BERTopicExperimentTrialResultModel>[]
  >(() => {
    const hyperparameterColumns: MRT_ColumnDef<BERTopicExperimentTrialResultModel>[] =
      [];
    if (data.constraint.max_topics != null) {
      hyperparameterColumns.push({
        header: 'Max. Topics',
        accessorKey: 'candidate.max_topics',
      });
    }
    if (data.constraint.min_topic_size != null) {
      hyperparameterColumns.push({
        header: 'Min. Topic Size',
        accessorKey: 'candidate.min_topic_size',
      });
    }
    if (data.constraint.topic_confidence_threshold != null) {
      hyperparameterColumns.push({
        header: 'Topic Confidence Threshold',
        accessorKey: 'candidate.topic_confidence_threshold',
      });
    }
    return [
      {
        header: 'Trial Number',
        accessorKey: 'trial_number',
      },
      {
        header: 'Timestamp',
        accessorKey: 'timestamp',
      },
      {
        header: 'Status',
        key: 'status',
        Cell(props) {
          const original = props.row.original;
          if (original.evaluation) {
            return <Pill color="green">Success</Pill>;
          } else {
            return <Pill color="red">Failed</Pill>;
          }
        },
      },
      ...hyperparameterColumns,
      {
        header: 'Topic Coherence',
        accessorKey: 'evaluation.coherence_v',
      },
      {
        header: 'Topic Diversity',
        accessorKey: 'evaluation.topic_diversity',
      },
      {
        header: 'Topic Count',
        key: 'topic_count',
        accessorFn(originalRow) {
          return originalRow.evaluation?.coherence_v_per_topic.length;
        },
      },
      {
        header: '',
        key: 'action',
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
  ]);

  const table = useMantineReactTable({
    data: data.trials,
    columns,
    ...MantineReactTableBehaviors.Default,
    enableFilters: true,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.Virtualized(data.trials, []),
    enableSorting: true,
    sortDescFirst: false,
  });

  return (
    <>
      <TopicModelExperimentResultTopicsModal ref={trialRemote} />
      <Stack className="h-full">
        <Card>
          <SimpleGrid cols={{ md: 2, base: 1 }}>
            {/* <TopicModelExperimentResultSortByChoiceChips
              sortBy={sortBy}
              setSortBy={setSortBy}
              data={data}
            /> */}
            <Switch
              checked={showFailed}
              onChange={(e) => setShowFailed(e.target.checked)}
              label="Should the failed trials be shown as well?"
            />
          </SimpleGrid>
        </Card>
        <MantineReactTable table={table} />
      </Stack>
    </>
  );
}

export default function TopicModelExperimentDetailsTab() {
  const { query, isStillPolling } = useTopicModelExperimentStatusQuery();
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent query={query} isLoading={query.isLoading}>
      {data && <TopicModelExperimentDetails data={data} />}
      <TopicModelExperimentLoadingNotification
        data={data}
        isStillPolling={isStillPolling}
      />
    </UseQueryWrapperComponent>
  );
}
