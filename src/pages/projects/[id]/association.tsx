import { useSendVariableAssociationRequest } from "@/api/association/mutation";
import { useGetVariableAssociationStatus } from "@/api/association/query";
import { ProjectModel } from "@/api/project/model";
import Colors from "@/common/constants/colors";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import ProjectAssociationRenderer from "@/modules/projects/association/renderer";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import { ProjectColumnSelectInput } from "@/modules/projects/common/select";
import { Alert, Group, Paper, Stack } from "@mantine/core";
import { ArrowsLeftRight, WarningCircle } from "@phosphor-icons/react";
import React from "react";
import Text from "@/components/standard/text";
import ProjectAssociationExcludedDonut from "@/modules/projects/association/excluded";

function ProjectAssociationPageBody(props: ProjectModel) {
  const { config } = props;
  const [column1, setColumn1] = React.useState<string | null>(
    config.dataSchema.columns.find(
      (col) => col.type === SchemaColumnTypeEnum.Textual
    )?.name ?? null
  );
  const [column2, setColumn2] = React.useState<string | null>(null);
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetVariableAssociationStatus,
    useSendRequest: useSendVariableAssociationRequest,
    autostart: true,
    input: {
      id: config.projectId,
      column1: column1!,
      column2: column2!,
    },
    enabled: !!column1 && !!column2,
  });
  const data = procedureProps.data?.data;

  return (
    <Stack>
      <ProcedureStatus
        title="Topic Association"
        description="Find out how closely related the topics that were found by the topic modeling algorithm to the other variables in the dataset."
        BelowDescription={
          <Group>
            <ProjectColumnSelectInput
              value={column1}
              data={config.dataSchema.columns.filter(
                (col) =>
                  col.type === SchemaColumnTypeEnum.Textual &&
                  col.name !== column2
              )}
              onChange={async (col) => {
                if (!col) return;
                setColumn1(col.name);
              }}
              selectProps={{
                w: 320,
              }}
            />
            <ArrowsLeftRight color={Colors.foregroundDull} />
            <ProjectColumnSelectInput
              value={column2}
              data={config.dataSchema.columns.filter(
                (col) =>
                  col.type !== SchemaColumnTypeEnum.Unique &&
                  col.name !== column1
              )}
              onChange={(col) => {
                if (!col) return;
                setColumn2(col.name);
              }}
            />
          </Group>
        }
        {...procedureProps}
      />
      {data && data.total != null && (
        <Paper p={16}>
          <Stack>
            {data.excluded && (
              <>
                <Alert color={Colors.sentimentWarning}>
                  <Group wrap="nowrap" align="center">
                    <WarningCircle />
                    <Text>
                      <Text c={Colors.sentimentError} fw="bold" span>
                        {data.excluded}
                      </Text>{" "}
                      out of{" "}
                      <Text fw="bold" span>
                        {data.total}
                      </Text>{" "}
                      rows has been excluded from the operation as either{" "}
                      <Text fw="bold" span>
                        {data.column1}
                      </Text>{" "}
                      or{" "}
                      <Text fw="bold" span>
                        {data.column2}
                      </Text>{" "}
                      contain missing values.
                    </Text>
                  </Group>
                </Alert>
              </>
            )}
            <Stack align="center">
              <ProjectAssociationExcludedDonut {...data} />
            </Stack>
            <ProjectAssociationRenderer {...data} />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

export default function ProjectAssociationPage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectAssociationPageBody {...project} />}
    </AppProjectLayout>
  );
}
