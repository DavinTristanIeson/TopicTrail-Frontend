import { Expose, Type } from "class-transformer";
import { ProjectConfigModel, ProjectDataSourceModel, ProjectSchemaManagerModel } from "./config";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import { DataFrame } from "@/api/common/model";

// Models
export class ProjectLiteModel {
  id: string;
  path: string;
}

export class ProjectModel extends ProjectLiteModel {
  @Type(() => ProjectConfigModel)
  config: ProjectConfigModel;
}


// Model - Infer Column
export class InferDatasetDescriptiveStatisticsModel {
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  q1: number;
  q3: number;
  max: number;

  @Expose({ name: "inlier_range" })
  inlierRange: [number, number];

  @Expose({ name: "outlier_count" })
  outlierCount: number;
}

export class InferDatasetColumnModel {
  name: string;
  type: SchemaColumnTypeEnum;
  count: number;

  categories: string[] | null;

  @Expose({ name: "document_lengths" })
  @Type(() => InferDatasetDescriptiveStatisticsModel)
  documentLengths: InferDatasetDescriptiveStatisticsModel | null;

  @Expose({ name: "document_lengths" })
  @Type(() => InferDatasetDescriptiveStatisticsModel)
  descriptiveStatistics: InferDatasetDescriptiveStatisticsModel | null;
}

export class ProjectCheckDatasetModel {
  @Expose({ name: "dataset_columns" })
  datasetColumns: string[];

  @Expose({ name: "preview_rows" })
  previewRows: DataFrame;

  @Expose({ name: "total_rows" })
  totalRows: DataFrame;

  @Type(() => InferDatasetColumnModel)
  columns: InferDatasetColumnModel[];
}


// Input

export interface ProjectIdInput {
  projectId: string;
}

export type ProjectCheckDatasetInput = ProjectDataSourceModel;
export interface ProjectCheckDatasetColumnInput {
  source: ProjectCheckDatasetInput;
  column: string;
  dtype: SchemaColumnTypeEnum;
}

export type ProjectMutationInput = ProjectConfigModel;
export type ProjectColumnsMutationInput = ProjectSchemaManagerModel;