import { useSendTopicEvaluationRequest } from "@/api/evaluation/mutation";
import {
  TopicEvaluationQueryKeys,
  useGetTopicEvaluationStatus,
} from "@/api/evaluation/query";
import { ProjectModel } from "@/api/project";
import { TopicQueryKeys } from "@/api/topics";
import { queryClient } from "@/common/api/query-client";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  isAdvisedToRunProcedure,
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import { ProjectColumnSelectInput } from "@/modules/projects/common/select";
import TopicEvaluationRenderer from "@/modules/projects/evaluation/renderer";
import { Stack } from "@mantine/core";
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
    autostart: true,
    enabled: !!columnName,
    keepPreviousData: true,
  });

  const data = procedureProps.data?.data;
  return (
    <Stack>
      <ProcedureStatus
        title="Topic Evaluation"
        description="Find out the quality of the topics that were discovered by the topic modeling algorithm. Note that the scores may be harder to interpret than classic classification scores like accuracy and precision."
        BelowDescription={
          <ProjectColumnSelectInput
            value={columnName}
            data={config.dataSchema.columns.filter(
              (col) => col.type === SchemaColumnTypeEnum.Textual
            )}
            onChange={async (col) => {
              if (!col) return;
              setColumnName(col.name);
            }}
          />
        }
        {...procedureProps}
      />
      {data && <TopicEvaluationRenderer {...data} />}
    </Stack>
  );
}

export default function TopicEvaluationPage() {
  return (
    <AppProjectLayout>
      {(project) => <TopicEvaluationPageBody {...project} />}
    </AppProjectLayout>
  );
}
