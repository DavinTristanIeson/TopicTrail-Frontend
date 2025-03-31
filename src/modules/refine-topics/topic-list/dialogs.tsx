import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType, TopicUpdateFormType } from '../form-type';
import { Alert, Button, Drawer, Group, Modal } from '@mantine/core';
import { FloppyDisk, Info } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import { ListSkeleton } from '@/components/visual/loading';
import { pickArrayById } from '@/common/utils/iterable';
import TopicUpdateForm from './topic-update';

export const UpdateTopicLabelDialog =
  React.forwardRef<ParametrizedDisclosureTrigger<number> | null>(
    function UpdateTopicLabelDialog(props, ref) {
      const [topicId, { close }] = useParametrizedDisclosureTrigger(ref);

      return (
        <Modal opened={!!topicId} onClose={close} title="Update Topic Metadata">
          {topicId && (
            <>
              <Alert color="blue" icon={<Info />}>
                By default, we use the first three topic words as the label of a
                topic. But this might not be useful to an analyst. In which
                case, we recommend that you use the topic words and documents to
                derive an appropriate label for the topic so that you can
                understand it easily when performing other analysis.
              </Alert>
              <TopicUpdateForm topicId={topicId} onClose={close} />
            </>
          )}
        </Modal>
      );
    },
  );

export const CreateNewTopicDialog = React.forwardRef<DisclosureTrigger | null>(
  function CreateNewTopicDialog(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    const { getValues } = useFormContext<RefineTopicsFormType>();
    const allTopics = getValues('topics');
    const lastTopicId = allTopics.reduce(
      (acc, topic) => Math.max(acc, topic.id),
      0,
    );
    const newTopicId = lastTopicId + 1;

    return (
      <Modal opened={opened} onClose={close} title="Create a New Topic">
        <Alert color="blue" icon={<Info />}>
          Perhaps you have noticed that some similar documents should be
          assigned into a new topic that doesn&apos;t exist in the topic list.
          In which case, feel free to create a new topic here. Newly created
          topics without any documents assigned to them will not be saved, so
          you should assign at least one document to this topic.
        </Alert>
        {opened && <TopicUpdateForm topicId={newTopicId} onClose={close} />}
      </Modal>
    );
  },
);

const SortableTopicDndContext = dynamic(
  () => import('./sortable-topic-context'),
  {
    ssr: false,
    loading() {
      return <ListSkeleton />;
    },
  },
);

interface SortTopicsDrawerBodyProps {
  topics: TopicUpdateFormType[];
  onSave(topics: TopicUpdateFormType[]): void;
}

function SortTopicsDrawerBody(props: SortTopicsDrawerBodyProps) {
  const { topics, onSave } = props;
  const [sortState, setSortState] =
    React.useState<TopicUpdateFormType[]>(topics);

  return (
    <>
      <Drawer.Header>
        <Group justify="end" className="w-full">
          <Button
            leftSection={<FloppyDisk />}
            onClick={() => {
              onSave(sortState);
            }}
          >
            Save
          </Button>
        </Group>
      </Drawer.Header>
      <SortableTopicDndContext
        topics={sortState}
        setTopicIds={(ids) => {
          const sortedTopics = pickArrayById(
            sortState,
            ids,
            (topic) => topic.id,
          );
          setSortState(sortedTopics);
        }}
      />
    </>
  );
}

export const RefineTopicsSortTopicsDrawer =
  React.forwardRef<DisclosureTrigger | null>(
    function RefineTopicsSortTopicsDrawer(props, ref) {
      const [opened, { close }] = useDisclosureTrigger(ref);
      const { setValue, control } = useFormContext<RefineTopicsFormType>();
      const topics = useWatch({
        name: 'topics',
        control,
      });

      return (
        <Drawer opened={opened} onClose={close} title="Sort Topics">
          {opened && (
            <SortTopicsDrawerBody
              topics={topics}
              onSave={(topics: TopicUpdateFormType[]) => {
                setValue('topics', topics);
                close();
              }}
            />
          )}
        </Drawer>
      );
    },
  );
