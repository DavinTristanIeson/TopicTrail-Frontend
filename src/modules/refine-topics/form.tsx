import { invalidateProjectDependencyQueries } from '@/api/project';
import { client } from '@/common/api/client';
import FormWrapper from '@/components/utility/form/wrapper';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useForm } from 'react-hook-form';
import { refineTopicsFormSchema, RefineTopicsFormType } from './form-type';
import { ProjectContext } from '../project/context';
import { ColumnTopicModelingResultModel } from '@/api/topic';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { yupResolver } from '@hookform/resolvers/yup';
import { RefineTopicsDocumentTable } from './document-table';
import { Button, Group } from '@mantine/core';
import {
  TableFilterButton,
  FilterStateProvider,
} from '@/modules/filter/context';
import { RefineTopicsTopicList } from './topic-list';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { RefineTopicsSortTopicsDrawer } from './topic-list/dialogs';
import { ArrowsDownUp, List } from '@phosphor-icons/react';
import SubmitButton from '@/components/standard/button/submit';

interface RefineTopicsFormProps {
  topicModelingResult: ColumnTopicModelingResultModel;
}

export default function RefineTopicsForm(props: RefineTopicsFormProps) {
  const { topicModelingResult } = props;
  const project = React.useContext(ProjectContext);
  const { replace } = useRouter();
  const defaultValues = React.useMemo<RefineTopicsFormType>(() => {
    return {
      document_topics: {},
      topics: topicModelingResult.result!.topics.map((topic) => {
        return {
          id: topic.id,
          label: topic.label,
          original: topic,
        };
      }),
    };
  }, [topicModelingResult.result]);
  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(refineTopicsFormSchema),
    defaultValues,
  });
  const { mutateAsync: refineTopics } = client.useMutation(
    'put',
    '/topic/{project_id}/refine',
    {
      onSuccess(data, variables) {
        invalidateProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  const onSubmit = React.useCallback(
    async (payload: RefineTopicsFormType) => {
      const res = await refineTopics({
        body: {
          document_topics: Object.entries(payload.document_topics)
            .filter((x) => x[1] != null)
            .map(([document_id, topic_id]) => {
              return {
                document_id: parseInt(document_id),
                topic_id: topic_id!,
              };
            }),
          topics: payload.topics.map((topic) => {
            return {
              id: topic.id,
              label: topic.label ?? null,
              description: topic.description ?? null,
              tags: topic.tags ?? null,
            };
          }),
        },
        params: {
          path: {
            project_id: project.id,
          },
          query: {
            column: topicModelingResult.column.name,
          },
        },
      });
      if (res.message) {
        showNotification({
          message: res.message,
          color: 'green',
        });
      }
      replace({
        pathname: NavigationRoutes.ProjectTopics,
        query: {
          id: project.id,
          column: topicModelingResult.column.name,
        },
      });
    },
    [project.id, refineTopics, replace, topicModelingResult.column],
  );

  const refineTopicRemote = React.useRef<DisclosureTrigger | null>(null);
  const sortTopicRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <FilterStateProvider>
        <RefineTopicsSortTopicsDrawer ref={sortTopicRemote} />
        <RefineTopicsTopicList
          column={topicModelingResult.column}
          ref={refineTopicRemote}
        />
        <Group justify="end" className="pb-5 pt-5">
          <Button
            variant="outline"
            onClick={() => {
              refineTopicRemote.current?.open();
            }}
            leftSection={<List />}
          >
            Open Topic List
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              sortTopicRemote.current?.open();
            }}
            leftSection={<ArrowsDownUp />}
          >
            Sort Topics
          </Button>
          {/* Use context */}
          <TableFilterButton state={null} />
          <SubmitButton>Save</SubmitButton>
        </Group>

        <RefineTopicsDocumentTable
          column={topicModelingResult.column}
          topics={topicModelingResult.result!.topics}
        />
      </FilterStateProvider>
    </FormWrapper>
  );
}
