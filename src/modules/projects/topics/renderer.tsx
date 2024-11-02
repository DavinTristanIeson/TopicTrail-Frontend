import { ProjectConfigModel } from "@/api/project/config.model";
import { useGetTopics, useSendTopicRequest } from "@/api/topics";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Button, Group, Stack, Title } from "@mantine/core";
import React from "react";
import ProcedureStatus, { useTriggerProcedure } from "../common/procedure";
import { Info } from "@phosphor-icons/react";
import PlotRenderer from "../common/plots";
import TopicSimilarityPlot from "./similarity";
import { ToggleDispatcher } from "@/hooks/dispatch-action";
import { ProjectColumnSelectInput } from "../common/select";

export default function TopicsRenderer(config: ProjectConfigModel) {
  const [columnName, setColumnName] = React.useState(
    config.dataSchema.columns.find(
      (col) => col.type == SchemaColumnTypeEnum.Textual
    )?.name ?? ""
  );

  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetTopics,
    useSendRequest: useSendTopicRequest,
    input: {
      id: config.projectId,
      column: columnName,
    },
    autostart: true,
    enabled: !!columnName,
    keepPreviousData: false,
  });

  const plot = procedureProps?.data?.data.plot;
  const remote = React.useRef<ToggleDispatcher | undefined>();

  return (
    <Stack>
      <Stack align="center">
        <Title order={2}>Topics</Title>
      </Stack>
      <ProcedureStatus
        {...procedureProps}
        title={`Topics of ${columnName}`}
        description={`View the topic information that has been found by the topic modeling algorithm in ${columnName}.`}
        refetchInterval={3000}
        BelowDescription={
          <Group align="flex-end">
            <ProjectColumnSelectInput
              value={columnName}
              onChange={async (e) => {
                if (!e) return;
                setColumnName(e.name);
              }}
              selectProps={{
                w: "100%",
                maw: 400,
                label: "Column",
                description: "Which textual column do you wish to analyze?",
                required: true,
                disabled: procedureProps.loading,
              }}
              data={config.dataSchema.columns.filter(
                (col) => col.type === SchemaColumnTypeEnum.Textual
              )}
            />
            {procedureProps.data && (
              <Button
                onClick={() => {
                  remote.current?.open();
                }}
                leftSection={<Info />}
                variant="subtle"
              >
                View Intertopic Relationship
              </Button>
            )}
          </Group>
        }
      />
      <TopicSimilarityPlot column={columnName} config={config} ref={remote} />
      <div className="relative w-full">
        {plot && <PlotRenderer plot={plot} />}
      </div>
    </Stack>
  );
}
