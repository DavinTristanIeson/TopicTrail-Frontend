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
import RefineTopicsTopicList from './topic-list';
import { FilterStateProvider } from '../table/context';
import { Group } from '@mantine/core';

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
  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <FilterStateProvider>
        <Group align="stretch" className="h-full" wrap="nowrap">
          <div style={{ width: 448 }}>
            <RefineTopicsTopicList column={topicModelingResult.column} />
          </div>
          <div className="flex-1">
            <RefineTopicsDocumentTable
              column={topicModelingResult.column}
              topics={topicModelingResult.result!.topics}
            />
          </div>
        </Group>
      </FilterStateProvider>
    </FormWrapper>
  );
}
