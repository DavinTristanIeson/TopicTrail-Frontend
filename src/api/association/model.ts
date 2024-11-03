import { AssociationDataTypeEnum } from "@/common/constants/enum";
import { Expose, Type } from "class-transformer";

// Models
export class VariableAssociationDataModel {
  type: AssociationDataTypeEnum;
  topics: string[];

  // Categorical
  outcomes?: string[];
  @Expose({name: "crosstab_heatmap"})
  crosstabHeatmap?: string;
  @Expose({name: "residual_heatmap"})
  residualHeatmap?: string;
  biplot?: string;

  // Continuous
  @Expose({name: "violin_plot"})
  violinPlot?: string;
  @Expose({name: "statistics_csv"})
  statisticsCSV?: string;
  
  // Temporal
  @Expose({name: "line_plot"})
  linePlot?: string;
}

export class VariableAssociationModel {
  column1: string;
  column2: string;
  total: number;
  excluded: number;

  @Expose({name: "excluded_left"})
  excludedLeft: number;
  
  @Expose({name: "excluded_right"})
  excludedRight: number;

  @Type(() => VariableAssociationDataModel)
  data: VariableAssociationDataModel;
}


// Input
export interface VariableAssociationInput {
  id: string;
  column1: string;
  column2: string;
}