import { ProjectModel } from "@/api/project/model";
import { useGetTopicModelingStatus, useStartTopicModeling } from "@/api/topics";
import { ProjectTaskStatus } from "@/common/constants/enum";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus from "@/modules/projects/common/procedure";
import TopicsRenderer from "@/modules/projects/topics/renderer";
import { Divider, Stack } from "@mantine/core";

function ProjectTopicsPageBody(props: ProjectModel) {
  const {
    data: status,
    refetch,
    isLoading,
    error: errorStatus,
  } = useGetTopicModelingStatus({
    id: props.id,
  });

  const {
    mutateAsync,
    isPending,
    error: errorExecute,
  } = useStartTopicModeling();
  return (
    <Stack gap={64}>
      <ProcedureStatus
        title="Topic Modeling"
        description="Let our algorithms discover the hidden topics present in your dataset. This procedure may take a few seconds up to a few minutes depending on the size of your dataset. Feel free to grab a coffee while you wait!"
        data={status}
        refetch={refetch}
        execute={() =>
          mutateAsync({
            id: props.id,
          })
        }
        loading={isLoading || isPending}
        error={
          errorExecute?.message || (status ? errorStatus?.message : undefined)
        }
      />

      <Divider />

      {status?.status == ProjectTaskStatus.Success && (
        <TopicsRenderer {...props.config} />
      )}
    </Stack>
  );
}

export default function ProjectTopicsPage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectTopicsPageBody {...project} />}
    </AppProjectLayout>
  );
}
