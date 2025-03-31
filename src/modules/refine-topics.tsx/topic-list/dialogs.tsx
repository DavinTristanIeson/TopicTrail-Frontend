import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType, TopicUpdateFormType } from '../form-type';
import {
  Alert,
  Button,
  Drawer,
  Group,
  Modal,
  Stack,
  TextInput,
} from '@mantine/core';
import * as Yup from 'yup';
import { useUncontrolled } from '@mantine/hooks';
import { FloppyDisk, Info } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import { ListSkeleton } from '@/components/visual/loading';
import { pickArrayById } from '@/common/utils/iterable';
import { getTopicLabel } from '@/api/topic';

interface TopicUpdateLabelDialogBodyProps {
  defaultValue: string;
  placeholder: string | undefined;
  setValue(value: string): void;
}

function TopicUpdateLabelDialogBody(props: TopicUpdateLabelDialogBodyProps) {
  const { defaultValue: defaultValue, setValue, placeholder } = props;

  const [topicLabel, setTopicLabel] = useUncontrolled({
    defaultValue,
  });
  const { getValues } = useFormContext<RefineTopicsFormType>();
  const allOtherLabels = React.useMemo(() => {
    const allTopics = getValues('topics');
    const allLabels = allTopics.map((topic) => topic.label).filter(Boolean);
    const allLabelsExceptThisOne = allLabels;
    if (defaultValue) {
      const defaultValueIdx = allLabelsExceptThisOne.indexOf(defaultValue);
      if (defaultValueIdx !== -1) {
        allLabelsExceptThisOne.splice(defaultValueIdx, 1);
      }
      return allLabelsExceptThisOne;
    }
    return allLabels;
  }, [defaultValue, getValues]);

  const schema = React.useMemo(() => {
    return Yup.string()
      .required()
      .notOneOf(
        allOtherLabels,
        'This label has already been used by another topic. To avoid confusion, we recommend that you assign unique labels to each topic.',
      );
  }, [allOtherLabels]);

  const error = React.useMemo<string | undefined>(() => {
    try {
      schema.validateSync(topicLabel);
      return undefined;
    } catch (e: any) {
      return e.message as string;
    }
  }, [schema, topicLabel]);

  return (
    <Stack>
      <TextInput
        label="Topic Label"
        value={topicLabel}
        required
        placeholder={placeholder}
        onChange={(e) => setTopicLabel(e.target.value)}
        error={error}
        description="A label to describe the topic. By default, the label used is a combination of the first three topic words; however, this kind of label might be harder to interpret during your analysis."
      />
      <Group justify="end">
        <Button
          leftSection={<FloppyDisk />}
          disabled={!!error}
          onClick={() => {
            setValue(topicLabel);
          }}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}

export const UpdateTopicLabelDialog =
  React.forwardRef<ParametrizedDisclosureTrigger<number> | null>(
    function UpdateTopicLabelDialog(props, ref) {
      const [topicId, { close }] = useParametrizedDisclosureTrigger(ref);
      const { setValue, getValues } = useFormContext<RefineTopicsFormType>();

      const allTopics = getValues('topics');
      const focusedTopicIndex = allTopics.findIndex(
        (topic) => topic.id != null && topic.id === topicId,
      );
      const focusedTopic = allTopics[focusedTopicIndex];

      React.useEffect(() => {
        if (focusedTopicIndex === -1) {
          close();
        }
      }, [close, focusedTopicIndex]);

      return (
        <Modal opened={!!focusedTopic} onClose={close}>
          <Alert color="blue" icon={<Info />}>
            By default, we use the first three topic words as the label of a
            topic. But this might not be useful to an analyst. In which case, we
            recommend that you use the topic words and documents to derive an
            appropriate label for the topic so that you can understand it easily
            when performing other analysis.
          </Alert>
          {focusedTopicIndex !== -1 && (
            <TopicUpdateLabelDialogBody
              defaultValue={
                getValues(`topics.${focusedTopicIndex}.label`) ?? ''
              }
              setValue={(value) => {
                setValue(`topics.${focusedTopicIndex}.label`, value);
                close();
              }}
              placeholder={
                focusedTopic?.original
                  ? getTopicLabel({
                      words: focusedTopic.original?.words,
                    })
                  : undefined
              }
            />
          )}
        </Modal>
      );
    },
  );

export const CreateNewTopicDialog = React.forwardRef<DisclosureTrigger | null>(
  function CreateNewTopicDialog(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    const { setValue, getValues } = useFormContext<RefineTopicsFormType>();
    const onAddNewTopic = React.useCallback(
      (newLabel: string) => {
        const allTopics = getValues('topics');
        const lastId = allTopics.reduce(
          (acc, topic) => Math.max(acc, topic.id),
          0,
        );
        allTopics.push({
          id: lastId,
          label: newLabel,
          original: null,
        });
        setValue('topics', allTopics);
        close();
      },
      [close, getValues, setValue],
    );

    return (
      <Modal opened={opened} onClose={close} title="Create a New Topic">
        <Alert color="blue" icon={<Info />}>
          Perhaps you have noticed that some similar documents should be
          assigned into a new topic that doesn&apos;t exist in the topic list.
          In which case, feel free to create a new topic here. Newly created
          topics without any documents assigned to them will not be saved, so
          you should assign at least one document to this topic.
        </Alert>
        {opened && (
          <TopicUpdateLabelDialogBody
            defaultValue=""
            placeholder={undefined}
            setValue={onAddNewTopic}
          />
        )}
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
