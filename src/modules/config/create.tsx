import { useRouter } from 'next/router';
import ProjectConfigForm from './form';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import { queryClient } from '@/common/api/query-client';
import { client } from '@/common/api/client';
import { ProjectModel, CreateProjectInput } from '@/api/project';
import { showNotification } from '@mantine/notifications';

interface ProjectConfigCreateFormProps {
  onSubmit(result: ProjectModel): void;
}

export default function ProjectConfigCreateForm(
  props: ProjectConfigCreateFormProps,
) {
  const { onSubmit: onAfterSubmit } = props;
  const { mutateAsync: create } = client.useMutation('post', '/projects/', {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: client.queryOptions('get', '/projects/').queryKey,
      });
    },
  });
  const router = useRouter();
  const onSubmit = async (input: CreateProjectInput) => {
    const res = await create({
      body: input,
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: 'green',
      });
    }
    onAfterSubmit(res.data);
  };
  return (
    <ProjectConfigForm onSubmit={onSubmit}>
      <ProjectConfigFormPhaseSwitcher />
    </ProjectConfigForm>
  );
}
