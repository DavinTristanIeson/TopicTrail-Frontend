import { useSendTopicEvaluationRequest } from "@/api/evaluation/mutation";
import { useGetTopicEvaluationStatus } from "@/api/evaluation/query";
import { ProjectModel } from "@/api/project";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import { ProjectColumnSelectInput } from "@/modules/projects/common/select";
import TopicEvaluationRenderer from "@/modules/projects/evaluation/renderer";
import { Group, Paper, Stack } from "@mantine/core";
import React from "react";

function TopicEvaluationPageBody(props: ProjectModel) {
  const { config } = props;
  const [columnName, setColumnName] = React.useState(
    config.dataSchema.columns.find(
      (col) => col.type === SchemaColumnTypeEnum.Textual
    )?.name ?? ""
  );
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetTopicEvaluationStatus,
    useSendRequest: useSendTopicEvaluationRequest,
    input: {
      id: props.id,
      column: columnName!,
    },
    autostart: false,
    enabled: !!columnName,
  });

  const data = procedureProps.data?.data;

  return (
    <Stack>
      <ProcedureStatus
        title="Topic Evaluation"
        description="Find out the quality of the topics that were discovered by the topic modeling algorithm. Note that the scores may be harder to interpret than classic classification scores like accuracy and precision."
        BelowDescription={
          <Group>
            <ProjectColumnSelectInput
              value={columnName}
              data={config.dataSchema.columns.filter(
                (col) => col.type === SchemaColumnTypeEnum.Textual
              )}
              onChange={async (col) => {
                if (!col) return;
                setColumnName(col.name);
              }}
              selectProps={{
                label: "Column",
                description:
                  "Pick the column whose topics are to be evaluated. The topic modeling procedure has to be executed beforehand.",
              }}
            />
          </Group>
        }
        {...procedureProps}
      />
      {data && data.cvScore != null && (
        <Paper className="relative w-full">
          <TopicEvaluationRenderer {...data} />
        </Paper>
      )}
    </Stack>
  );
}

export default function TopicEvaluationPage() {
  return (
    <>
      <AppProjectLayout>
        {(project) => <TopicEvaluationPageBody {...project} />}
      </AppProjectLayout>
    </>
  );
}
