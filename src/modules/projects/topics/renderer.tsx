import { ProjectConfigModel } from "@/api/project/config.model";
import { useGetTopics, useSendTopicRequest } from "@/api/topics";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Select, Stack, Title } from "@mantine/core";
import React from "react";
import ProcedureStatus from "../common/procedure";
import dynamic from "next/dynamic";
import { handleErrorFn } from "@/common/utils/error";
import { showNotification } from "@mantine/notifications";
import Colors from "@/common/constants/colors";
import { error } from "console";

// See this discussion: https://github.com/plotly/react-plotly.js/issues/272
// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function TopicsRenderer(config: ProjectConfigModel) {
  console.log(config);
  const [columnName, setColumnName] = React.useState(
    config.dataSchema.columns.find(
      (col) => col.type == SchemaColumnTypeEnum.Textual
    )!.name
  );
  const {
    data,
    isFetching,
    refetch,
    error: errorStatus,
  } = useGetTopics({
    id: config.projectId,
    column: columnName,
  });
  const { mutateAsync, isPending, error: errorExecute } = useSendTopicRequest();
  const requestTopic = handleErrorFn(async (column: string) => {
    const res = await mutateAsync({
      id: config.projectId,
      column,
    });
    return res;
  });

  return (
    <Stack>
      <Stack align="center">
        <Title order={2}>Topics</Title>
      </Stack>
      <ProcedureStatus
        data={data}
        title={`Topics of ${columnName}`}
        description={`View the topic information that has been found by the topic modeling algorithm in ${columnName}.`}
        BelowDescription={
          <Select
            value={columnName}
            w="100%"
            maw={400}
            onChange={(e) => {
              if (!e) return;
              setColumnName(e);
              requestTopic(e);
            }}
            label="Column"
            description="Which textual column do you wish to analyze?"
            required
            clearable={false}
            allowDeselect={false}
            data={config.dataSchema.columns.map((col) => {
              return {
                label: col.name,
                value: col.name,
              };
            })}
          />
        }
        execute={() => requestTopic(columnName)}
        error={
          errorExecute?.message ?? (data ? errorStatus?.message : undefined)
        }
        loading={isFetching || isPending}
        refetch={refetch}
        refetchInterval={5000}
      />
      {/* <div className="relative">
        {data?.data.plot && <Plot {...data?.data.plot} />}
      </div> */}
    </Stack>
  );
}
