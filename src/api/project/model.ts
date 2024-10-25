import { Type } from "class-transformer";
import { ProjectConfigModel } from "./config.model";
import { ProjectTaskStatus } from "@/common/constants/enum";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";

// Models
export class ProjectTaskResult<T> {
  data: T
  status: ProjectTaskStatus;
  message?: string;
  error?: string;
  progress?: number;
}

export class ProjectLiteModel {
  id: string;
  path: string;
}

export class ProjectModel {
  id: string;

  @Type(() => ProjectConfigModel)
  config: ProjectConfigModel;
}

export class ProjectCheckIdModel {
  available: boolean;
}

export class ProjectCheckDatasetModel {
  columns: {
    name: string;
    type: SchemaColumnTypeEnum;
  }[];
}

// Input

export interface ProjectCheckIdInput {
  projectId: string;
}
