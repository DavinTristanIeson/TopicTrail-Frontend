import { ProjectConfigModel } from "@/api/project/config.model";
import { useGetTopics, useSendTopicRequest } from "@/api/topics";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Button, Group, Select, Stack, Title } from "@mantine/core";
import React from "react";
import ProcedureStatus, { useTriggerProcedure } from "../common/procedure";
import { Info } from "@phosphor-icons/react";
import PlotRenderer from "../common/plots";
import TopicSimilarityPlot from "./similarity";
import { ToggleDispatcher } from "@/hooks/dispatch-action";

export default function TopicsRenderer(config: ProjectConfigModel) {
  const [columnName, setColumnName] = React.useState(
    config.dataSchema.columns.find(
      (col) => col.type == SchemaColumnTypeEnum.Textual
    )!.name
  );

  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetTopics,
    useSendRequest: useSendTopicRequest,
    input: {
      id: config.projectId,
      column: columnName,
    },
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
            <Select
              value={columnName}
              w="100%"
              maw={400}
              onChange={async (e) => {
                if (!e) return;
                await procedureProps.execute();
                setColumnName(e);
              }}
              label="Column"
              description="Which textual column do you wish to analyze?"
              required
              clearable={false}
              allowDeselect={false}
              disabled={procedureProps.loading}
              data={config.dataSchema.columns.map((col) => {
                return {
                  label: col.name,
                  value: col.name,
                };
              })}
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
        {plot && (
          <div className="relative w-full">
            <PlotRenderer plot={plot} />
          </div>
        )}
      </div>
    </Stack>
  );
}
