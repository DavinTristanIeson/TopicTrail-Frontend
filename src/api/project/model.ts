import { Expose, Type } from "class-transformer";
import { ProjectConfigModel } from "./config.model";
import { SchemaColumnTypeEnum, DocumentEmbeddingMethodEnum, ProjectTaskStatus } from "@/common/constants/enum";

// Models
export class ProjectTaskResult<T> {
  data: T
  status: ProjectTaskStatus;
  message?: string;
  error?: string;
  progress?: number;
  timestamp: number;

  static isPending(data: ProjectTaskResult<any>): boolean {
    return data.status === ProjectTaskStatus.Pending || data.status === ProjectTaskStatus.Idle
  }
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

export class ProjectDatasetInferredColumnModel {
  name: string;
  type: SchemaColumnTypeEnum;

  @Expose({name: "min_topic_size"})
  minTopicSize?: number;
  
  @Expose({name: "embedding_method"})
  embeddingMethod?: DocumentEmbeddingMethodEnum;

  @Expose({name: "min_document_length"})
  minDocumentLength?: number;

  @Expose({name: "min_word_frequency"})
  minWordFrequency?: number;
}
export class ProjectCheckDatasetModel {
  @Type(() => ProjectDatasetInferredColumnModel)
  columns: ProjectDatasetInferredColumnModel[];
}

// Input

export interface ProjectCheckIdInput {
  projectId: string;
}
