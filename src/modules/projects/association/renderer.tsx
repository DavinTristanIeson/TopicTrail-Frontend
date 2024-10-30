import {
  VariableAssociationDataModel,
  VariableAssociationModel,
} from "@/api/association/model";
import { AssociationDataTypeEnum } from "@/common/constants/enum";
import { Alert, Group, Select, Stack } from "@mantine/core";
import PlotRenderer from "../common/plots";
import React from "react";
import Colors from "@/common/constants/colors";
import { Info } from "@phosphor-icons/react";

enum CategoricalAssociationVisualizationType {
  CrossTabulation = "cross-tabulation",
  Residual = "residual",
  Biplot = "biplot",
}

function CategoricalAssociationRenderer(props: VariableAssociationModel) {
  const { column1, column2, data } = props;
  const [mode, setMode] = React.useState(
    CategoricalAssociationVisualizationType.CrossTabulation
  );
  return (
    <Stack>
      <Group>
        <Select
          data={[
            {
              value: CategoricalAssociationVisualizationType.CrossTabulation,
              label: "Cross-Tabulation Heatmap",
            },
            {
              value: CategoricalAssociationVisualizationType.Residual,
              label: "Residual Heatmap",
            },
          ]}
          onChange={(e) =>
            setMode(e as CategoricalAssociationVisualizationType)
          }
          allowDeselect={false}
          clearable={false}
        />
        <Alert color={Colors.sentimentInfo}>
          <Info size={24} />
          {mode === CategoricalAssociationVisualizationType.CrossTabulation
            ? `The color of a single cell represents how many outcomes of \"${column1}\" appear at the same time as \"${column2}\". While this frequency may indicate relatedness, please note that imbalanced datasets may also cause normal co-frequencies to be highlighted in the graph. Interpret it with caution.`
            : `The color of a single cell represents how unexpected the value as calculated by Pearson's residuals. A value is according to expectations if it has a residual of 0, and gets more unexpected the farther the value is from 0.`}
        </Alert>
      </Group>
      {data.crosstabHeatmap &&
        mode === CategoricalAssociationVisualizationType.CrossTabulation && (
          <PlotRenderer plot={data.crosstabHeatmap} />
        )}
      {data.residualHeatmap &&
        mode === CategoricalAssociationVisualizationType.Residual && (
          <PlotRenderer plot={data.residualHeatmap} />
        )}
    </Stack>
  );
}

function ContinuousAssociationRenderer(props: VariableAssociationModel) {
  const { column1, column2, data } = props;
  return (
    <Stack>{data.violinPlot && <PlotRenderer plot={data.violinPlot} />}</Stack>
  );
}

function TemporalAssociationRenderer(props: VariableAssociationModel) {
  const { column1, column2, data } = props;
  return (
    <Stack>{data.linePlot && <PlotRenderer plot={data.linePlot} />}</Stack>
  );
}

export default function ProjectAssociationRenderer(
  props: VariableAssociationModel
) {
  if (props.data.type === AssociationDataTypeEnum.Categorical) {
    return <CategoricalAssociationRenderer {...props} />;
  } else if (props.data.type === AssociationDataTypeEnum.Continuous) {
    return <ContinuousAssociationRenderer {...props} />;
  } else if (props.data.type === AssociationDataTypeEnum.Temporal) {
    return <TemporalAssociationRenderer {...props} />;
  } else {
    return null;
  }
}
