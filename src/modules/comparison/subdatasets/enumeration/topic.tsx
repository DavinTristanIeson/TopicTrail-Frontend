import { ComparisonStateItemModel } from '@/api/comparison';
import { TopicModel, getTopicLabel } from '@/api/topic';
import NavigationRoutes from '@/common/constants/routes';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { ProjectPageLinks } from '@/components/utility/links';
import { useMultiSelectSelectAllCheckbox } from '@/components/visual/select';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { Switch, MultiSelect, Button, Alert, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { List, Warning } from '@phosphor-icons/react';
import { uniq, identity, zip } from 'lodash-es';
import { useComparisonAppState } from '../../app-state';
import { assignUniqueNames } from './utils';
import { SchemaColumnModel } from '@/api/project';
import React from 'react';

interface EnumerateValuesActionsProps {
  column: SchemaColumnModel;
}
interface EnumerateTopicValuesActionsInnerProps
  extends EnumerateValuesActionsProps {
  topics: TopicModel[];
}

interface EnumerateTopicValuesActionsTagsInputProps {
  topics: TopicModel[];
  grouperTags: string[] | null;
  setGrouperTags: React.Dispatch<React.SetStateAction<string[] | null>>;
}

function EnumerateTopicValuesActionsTagsInput(
  props: EnumerateTopicValuesActionsTagsInputProps,
) {
  const { topics, grouperTags, setGrouperTags } = props;
  const uniqueTags = React.useMemo(() => {
    return uniq(topics.flatMap((topic) => topic.tags ?? []));
  }, [topics]);

  const inputContainer = useMultiSelectSelectAllCheckbox({
    data: uniqueTags,
    value: grouperTags ?? [],
    onChange: setGrouperTags,
    accessor: identity,
  });
  if (uniqueTags.length === 0) return;
  return (
    <>
      <Switch
        onChange={(e) => {
          if (e.target.checked) {
            setGrouperTags([]);
          } else {
            setGrouperTags(null);
          }
        }}
        checked={grouperTags != null}
        label="Group by Tags"
        description="Should the topics be grouped by their tags? Keep this option off if you don't want to group the topics by tags."
      />
      {grouperTags && (
        <MultiSelect
          label="Tags"
          description="Enter the tags you want to group the topics by."
          value={grouperTags}
          data={uniqueTags}
          onChange={setGrouperTags}
          className="w-full"
          inputContainer={inputContainer}
        />
      )}
    </>
  );
}

function EnumerateTopicValuesActionsInner(
  props: EnumerateTopicValuesActionsInnerProps,
) {
  const { column, topics } = props;
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
  );
  const [grouperTags, setGrouperTags] = React.useState<string[] | null>(null);

  const enumerateTopics = React.useCallback(() => {
    const uniqueNames = assignUniqueNames(topics.map(getTopicLabel));
    return zip(uniqueNames, topics).map(([label, topic]) => {
      return {
        name: label!,
        visible: true,
        filter: {
          type: 'and',
          operands: [
            {
              type: 'equal_to',
              target: column.name,
              value: topic!.id,
            },
          ],
        },
      } as ComparisonStateItemModel;
    });
  }, [column.name, topics]);

  const enumerateGroupedTopics = React.useCallback(() => {
    if (!grouperTags || (grouperTags != null && grouperTags.length === 0)) {
      showNotification({
        message: 'Choose at least one tag to group the subdatasets by.',
        color: 'red',
      });
      return;
    }
    const topicTags = topics.map((topic) => ({ tags: topic.tags }));
    const groupedTopics = grouperTags.map((tag) => {
      const indices = filterByString(tag, topicTags);
      return pickArrayByIndex(topics, indices);
    });
    const includedTopicIds = new Set(
      groupedTopics.flatMap((topics) => topics.map((topic) => topic.id)),
    );
    const ungroupedTopics = topics.filter((topic) => {
      return !includedTopicIds.has(topic.id);
    });
    const subdatasetNames = assignUniqueNames([
      ...grouperTags,
      'Uncategorized Topics',
    ]);
    const subdatasets = zip(
      subdatasetNames.slice(0, grouperTags.length),
      groupedTopics,
    )
      .filter((x) => x[1]!.length > 0)
      .map(([name, topics]) => {
        return {
          name: name,
          filter: {
            type: 'and',
            operands: [
              {
                type: 'is_one_of',
                target: column.name,
                values: topics!.map((topic) => topic.id),
              },
            ],
          },
        } as ComparisonStateItemModel;
      });

    if (ungroupedTopics.length > 0) {
      subdatasets.push({
        name: subdatasetNames[subdatasetNames.length - 1]!,
        filter: {
          type: 'and',
          operands: [
            {
              type: 'is_one_of',
              target: column.name,
              values: ungroupedTopics.map((topic) => topic.id),
            },
          ],
        },
      });
    }
    return subdatasets;
  }, [column.name, grouperTags, topics]);

  const enumerateSubdatasets = React.useCallback(() => {
    let subdatasets: ComparisonStateItemModel[] | undefined;
    if (grouperTags) {
      subdatasets = enumerateGroupedTopics();
    } else {
      subdatasets = enumerateTopics();
    }
    if (!subdatasets) return;
    setComparisonGroups(subdatasets);
    setVisibility(
      new Map(subdatasets.map((subdataset) => [subdataset.name, true])),
    );
    showNotification({
      message: `We have successfully created subdatasets based on the topics of ${column.name}`,
      color: 'green',
    });
  }, [
    column.name,
    enumerateGroupedTopics,
    enumerateTopics,
    grouperTags,
    setComparisonGroups,
    setVisibility,
  ]);

  return (
    <>
      <EnumerateTopicValuesActionsTagsInput
        grouperTags={grouperTags}
        setGrouperTags={setGrouperTags}
        topics={topics}
      />
      <Button
        onClick={enumerateSubdatasets}
        disabled={!column}
        leftSection={<List />}
        className="max-w-sm"
      >
        Enumerate Topics of {column.name}
      </Button>
    </>
  );
}

export default function EnumerateTopicValuesActions(
  props: EnumerateValuesActionsProps,
) {
  const { column } = props;
  const topicModelingResult = useTopicModelingResultOfColumn(
    column.source_name,
  );
  if (!topicModelingResult?.result) {
    return (
      <Alert color="red" icon={<Warning />}>
        The topic model has not been run on{' '}
        <Text fw={500} inherit span>
          {column.name}
        </Text>
        , so there are no topics to enumerate! Please head to the{' '}
        <ProjectPageLinks route={NavigationRoutes.ProjectTopics}>
          Topics Page
        </ProjectPageLinks>{' '}
        to run the topic model on this column.
      </Alert>
    );
  }
  const topics = topicModelingResult?.result?.topics;

  return <EnumerateTopicValuesActionsInner topics={topics} column={column} />;
}
