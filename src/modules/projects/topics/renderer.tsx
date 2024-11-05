import { ProjectConfigModel } from "@/api/project/config.model";
import { TopicsModel, useGetTopics, useSendTopicRequest } from "@/api/topics";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Button, Group, Paper, RingProgress, Stack } from "@mantine/core";
import React from "react";
import ProcedureStatus, { useTriggerProcedure } from "../common/procedure";
import { Info } from "@phosphor-icons/react";
import PlotRenderer from "../common/plots";
import TopicSimilarityPlot from "./similarity";
import { ToggleDispatcher } from "@/hooks/dispatch-action";
import { ProjectColumnSelectInput } from "../common/select";
import { SupplementaryInfoField } from "../common/table";
import Colors from "@/common/constants/colors";
import Text from "@/components/standard/text";

function TopicRendererBody(props: TopicsModel) {
  const outlierPercentage = (props.outliers / props.total) * 100;
  const validPercentage = (props.valid / props.total) * 100;
  const invalidPercentage = (props.invalid / props.total) * 100;
  return (
    <>
      {props.topicsBarchart && (
        <Paper className="relative w-full" p={16}>
          <PlotRenderer
            plot={props.topicsBarchart}
            height={Math.ceil(props.topics.length / 4) * 360}
          />
        </Paper>
      )}
      <Paper p={16} className="relative w-full">
        <Stack align="center">
          <Group gap={32} justify="space-around" w="100%">
            <SupplementaryInfoField
              label="Outliers"
              value={props.outliers}
              color={Colors.sentimentError}
              tooltip="Some documents may be categorized as outliers because they do not possess enough informative words to be categorized into any of the available topics."
            />
            <SupplementaryInfoField label="Valid" value={props.valid} />
            <SupplementaryInfoField
              label="Invalid"
              value={props.invalid}
              color={Colors.foregroundDull}
              tooltip="Some documents may end up being invalid after the preprocessing step according to your preprocessing configuration. For example: short documents or documents with a lot of common words may end up being filtered after they have been preprocessed due to their abnormally short length."
            />
          </Group>
          <RingProgress
            size={180}
            thickness={16}
            label={
              <Stack align="center" gap={0}>
                <Text
                  size="xs"
                  ta="center"
                  px="xs"
                  style={{ pointerEvents: "none" }}
                  c={Colors.foregroundDull}
                >
                  Total
                </Text>
                <Text size="lg" c={Colors.foregroundPrimary} fw="bold">
                  {props.total}
                </Text>
              </Stack>
            }
            sections={[
              {
                value: outlierPercentage,
                color: Colors.sentimentError,
                tooltip: `Outliers (${outlierPercentage.toFixed(2)}%)`,
              },
              {
                value: invalidPercentage,
                color: Colors.foregroundDull,
                tooltip: `Invalid (${invalidPercentage.toFixed(2)}%)`,
              },
              {
                value: validPercentage,
                color: Colors.foregroundPrimary,
                tooltip: `Valid (${validPercentage.toFixed(2)}%)`,
              },
            ]}
          />
        </Stack>

        <PlotRenderer plot={props.frequencyBarchart} />
      </Paper>
    </>
  );
}

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
  });

  const data = procedureProps?.data?.data;
  const remote = React.useRef<ToggleDispatcher | undefined>();

  return (
    <Stack>
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
                Topic Overview
              </Button>
            )}
          </Group>
        }
      />
      <TopicSimilarityPlot column={columnName} config={config} ref={remote} />
      {data && data.topicsBarchart && <TopicRendererBody {...data} />}
    </Stack>
  );
}
