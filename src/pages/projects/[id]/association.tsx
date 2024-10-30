import { useSendVariableAssociationRequest } from "@/api/association/mutation";
import { useGetVariableAssociationStatus } from "@/api/association/query";
import { ProjectModel } from "@/api/project/model";
import Colors from "@/common/constants/colors";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import CustomizableSelect from "@/components/standard/select/customizable";
import ProjectAssociationRenderer from "@/modules/projects/association/renderer";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import { ProjectColumnSelectInput } from "@/modules/projects/common/select";
import { Group, Select, Stack, Title } from "@mantine/core";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import React from "react";

function ProjectAssociationPageBody(props: ProjectModel) {
  const { config } = props;
  const [column1, setColumn1] = React.useState<string | undefined>(
    config.dataSchema.columns.find(
      (col) => col.type !== SchemaColumnTypeEnum.Textual
    )?.name
  );
  const [column2, setColumn2] = React.useState<string | undefined>(undefined);
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetVariableAssociationStatus,
    useSendRequest: useSendVariableAssociationRequest,
    keepPreviousData: true,
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
              data={config.dataSchema.columns.filter(
                (col) => col.type === SchemaColumnTypeEnum.Textual
              )}
              onChange={(col) => setColumn1(col?.name)}
            />
            <ArrowsLeftRight color={Colors.foregroundDull} />
            <ProjectColumnSelectInput
              data={config.dataSchema.columns.filter(
                (col) => col.type !== SchemaColumnTypeEnum.Unique
              )}
              onChange={(col) => setColumn2(col?.name)}
            />
          </Group>
        }
        {...procedureProps}
      />
      {data && <ProjectAssociationRenderer {...data} />}
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
