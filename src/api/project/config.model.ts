import { DataSourceTypeEnum, SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Expose, Type } from "class-transformer";

export class ProjectDataSourceModel {
  path: string
  type: DataSourceTypeEnum;

  // Excel-only
  @Expose({ name: 'sheet_name' })
  sheetName?: string;

  // CSV-only
  delimiter?: string;
  limit?: number | null;
}

export class TextPreprocessingConfigModel {
  @Expose({ name: "ignore_tokens" })
  ignoreTokens: string[];
  stopwords: string[];

  @Expose({ name: "remove_email" })
  removeEmail: boolean;

  @Expose({ name: "remove_url" })
  removeUrl: boolean;

  @Expose({ name: "remove_number" })
  removeNumber: boolean;
}

export class TopicModelingConfigModel {
  @Expose({ name: "low_memory" })
  lowMemory: boolean;

  @Expose({ name: "min_topic_size" })
  minTopicSize: number;

  @Expose({ name: "max_topic_size" })
  maxTopicSize: number;

  @Expose({ name: "max_topics" })
  maxTopics: number;

  @Expose({ name: "n_gram_range" })
  nGramRange: number;

  @Expose({ name: "seed_topics" })
  seedTopics: string[][] | null;

  @Expose({ name: "no_outliers" })
  noOutliers: boolean;

  @Expose({ name: "represent_outliers" })
  representOutliers: boolean;
}

export class ProjectSchemaModel {
  name: string;
  type: SchemaColumnTypeEnum;

  // Continuous
  @Expose({ name: "lower_bound" })
  lowerBound?: number;

  @Expose({ name: "lower_bound" })
  upperBound?: number;

  // Categorical
  @Expose({ name: "min_frequency" })
  minFrequency?: number;

  // Temporal

  @Expose({ name: "min_date" })
  @Type(() => Date)
  minDate?: Date;

  @Expose({ name: "max_date" })
  @Type(() => Date)
  maxDate?: Date;

  bins?: number

  @Expose({ name: "datetime_format" })
  datetimeFormat: string;

  @Type(() => TextPreprocessingConfigModel)
  preprocessing: TextPreprocessingConfigModel

  @Type(() => TopicModelingConfigModel)
  topic: TopicModelingConfigModel
}


export class ProjectSchemaManagerModel {
  @Type(() => ProjectSchemaModel)
  columns: ProjectSchemaModel[];
}

export class ProjectConfigModel {
  version: number;

  @Expose({ name: "project_id" })
  projectId: string;

  @Type(() => ProjectDataSourceModel)
  source: ProjectDataSourceModel

  @Type(() => ProjectSchemaModel)
  dfschema: ProjectSchemaModel;
}
