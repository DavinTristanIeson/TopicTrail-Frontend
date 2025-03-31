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
import { FilterStateProvider } from '../table/context';
import { Button, Group } from '@mantine/core';
import { TableFilterButton } from '../filter/drawer';
import { RefineTopicsTopicList } from './topic-list';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { RefineTopicsSortTopicsDrawer } from './topic-list/dialogs';
import { ArrowsDownUp, List } from '@phosphor-icons/react';

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
          document_topics: Object.entries(payload.document_topics).map(
            ([document_id, topic_id]) => {
              return {
                document_id: parseInt(document_id),
                topic_id,
              };
            },
          ),
          topics: payload.topics.map((topic) => {
            return {
              id: topic.id,
              label: topic.label ?? null,
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
      replace(NavigationRoutes.ProjectTopics, {
        query: {
          id: project.id,
        },
      });
    },
    [project.id, refineTopics, replace, topicModelingResult.column.name],
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
        <Group justify="end" className="pb-5">
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
          <TableFilterButton />
        </Group>

        <RefineTopicsDocumentTable
          column={topicModelingResult.column}
          topics={topicModelingResult.result!.topics}
        />
      </FilterStateProvider>
    </FormWrapper>
  );
}
