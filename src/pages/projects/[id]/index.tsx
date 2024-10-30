import { ProjectModel } from "@/api/project/model";
import { useGetTopicModelingStatus, useStartTopicModeling } from "@/api/topics";
import { ProjectTaskStatus } from "@/common/constants/enum";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import TopicsRenderer from "@/modules/projects/topics/renderer";
import { Divider, Stack } from "@mantine/core";

function ProjectTopicsPageBody(props: ProjectModel) {
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetTopicModelingStatus,
    useSendRequest: useStartTopicModeling,
    input: {
      id: props.id,
    },
    keepPreviousData: true,
  });
  return (
    <Stack gap={64}>
      <ProcedureStatus
        title="Topic Modeling"
        description="Let our algorithms discover the hidden topics present in your dataset. This procedure may take a few seconds up to a few minutes depending on the size of your dataset. Feel free to grab a coffee while you wait!"
        {...procedureProps}
      />

      {procedureProps.data?.status == ProjectTaskStatus.Success && (
        <>
          <Divider />
          <TopicsRenderer {...props.config} />
        </>
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
