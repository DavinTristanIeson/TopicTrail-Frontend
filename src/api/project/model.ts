import { Type } from "class-transformer";
import { ProjectConfigModel } from "./config.model";

// Models
export class ProjectLiteModel {
  id: string;
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
    type: string;
  }[];
}

// Input

export interface ProjectCheckIdInput {
  projectId: string;
}

export interface ProjectCheckDatasetInput {
  path: string;
}
