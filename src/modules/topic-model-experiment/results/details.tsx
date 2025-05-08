import {
  BERTopicExperimentResultModel,
  BERTopicExperimentTrialResultModel,
} from '@/api/topic';
import { Card, SimpleGrid, Stack, Switch } from '@mantine/core';
import {
  useTopicModelExperimentAppState,
  useTopicModelExperimentStatusQuery,
} from '../app-state';
import React from 'react';
import TopicModelExperimentResultSortByChoiceChips from './details/chip';
import { TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY } from './component/select';
import { TopicModelExperimentResultListItem } from './details/list-item';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import TopicModelExperimentResultTopicsModal from './details/modal';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';

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

  const trials = React.useMemo(() => {
    const accessor = sortBy
      ? TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[sortBy.type]?.accessor
      : undefined;
    let trials: BERTopicExperimentTrialResultModel[];
    if (showFailed) {
      trials = data.trials.slice();
    } else {
      trials = data.trials.filter((trial) => !!trial.evaluation);
    }
    if (accessor) {
      trials = data.trials.sort((a, b) => {
        const accessedA = accessor(a);
        const accessedB = accessor(b);
        if (accessedA == null || accessedB == null) {
          return 1;
        }
        return accessedA - accessedB;
      });
    }
    return trials;
  }, [data.trials, showFailed, sortBy]);

  const trialRemote =
    React.useRef<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null>(
      null,
    );

  return (
    <>
      <TopicModelExperimentResultTopicsModal ref={trialRemote} />
      <Stack className="h-full">
        <Card>
          <SimpleGrid cols={{ md: 2, base: 1 }}>
            <TopicModelExperimentResultSortByChoiceChips
              sortBy={sortBy}
              setSortBy={setSortBy}
              data={data}
            />
            <Switch
              checked={showFailed}
              onChange={(e) => setShowFailed(e.target.checked)}
              label="Should the failed trials be shown as well?"
            />
          </SimpleGrid>
        </Card>
        <Stack className="h-full overflow-y-auto">
          {trials.map((trial) => (
            <Card key={trial.trial_number}>
              <TopicModelExperimentResultListItem
                trial={trial}
                trialRemote={trialRemote}
              />
            </Card>
          ))}
        </Stack>
      </Stack>
    </>
  );
}

export default function TopicModelExperimentDetailsTab() {
  const { query } = useTopicModelExperimentStatusQuery();
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent query={query} isLoading={query.isLoading}>
      {data && <TopicModelExperimentDetails data={data} />}
    </UseQueryWrapperComponent>
  );
}
