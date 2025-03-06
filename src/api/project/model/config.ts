import { DataSourceTypeEnum, DocumentEmbeddingMethodEnum, DocumentPreprocessingMethodEnum, GeospatialRoleEnum, SchemaColumnTypeEnum } from "@/common/constants/enum";
import { Expose, Type } from "class-transformer";

export class ProjectDataSourceModel {
  path: string
  type: DataSourceTypeEnum;

  // Excel-only
  @Expose({ name: 'sheet_name' })
  sheetName?: string;

  // CSV-only
  delimiter?: string;
}

export class TextPreprocessingConfigModel {
  @Expose({ name: "pipeline_type" })
  pipelineType: DocumentPreprocessingMethodEnum;

  @Expose({ name: "ignore_tokens" })
  ignoreTokens: string[];

  stopwords: string[];

  @Expose({ name: "remove_email" })
  removeEmail: boolean;

  @Expose({ name: "remove_url" })
  removeUrl: boolean;

  @Expose({ name: "remove_number" })
  removeNumber: boolean;

  @Expose({ name: "min_df" })
  minDf: number;

  @Expose({ name: "max_df" })
  maxDf: number;

  @Expose({ name: "max_unique_words" })
  maxUniqueWords: number;

  @Expose({ name: "min_document_length" })
  minDocumentLength: number;

  @Expose({ name: "min_word_length" })
  minWordLength: number;
}

export class TopicModelingConfigModel {
  @Expose({ name: "low_memory" })
  lowMemory: boolean;

  @Expose({ name: "min_topic_size" })
  minTopicSize: number;

  @Expose({ name: "max_topic_size" })
  maxTopicSize: number | null;

  @Expose({ name: "clustering_conservativeness" })
  clusteringConservativeness: number;

  @Expose({ name: "globality_consideration" })
  globalityConsideration: number | null;

  @Expose({ name: "max_topics" })
  maxTopics: number | null;

  @Expose({ name: "n_gram_range" })
  nGramRange: [number, number];

  @Expose({ name: "embedding_method" })
  embeddingMethod: DocumentEmbeddingMethodEnum;

  @Expose({ name: "super_topic_similarity" })
  superTopicSimilarity: number;

  @Expose({ name: "top_n_words" })
  topNWords: number;

  @Expose({ name: "no_outliers" })
  noOutliers: boolean;

  @Expose({ name: "represent_outliers" })
  representOutliers: boolean;
}

export class ProjectSchemaModel {
  name: string;
  type: SchemaColumnTypeEnum;
  alias: string | null;

  // Continuous
  bins?: number[] | null;

  @Expose({ name: "bin_count" })
  binCount?: number | null;

  // Ordered categorical
  @Expose({ name: "category_order" })
  categoryOrder?: string[] | null;

  // Temporal
  @Expose({ name: "datetime_format" })
  datetimeFormat?: string | null;

  // Textual
  @Type(() => TextPreprocessingConfigModel)
  preprocessing?: TextPreprocessingConfigModel;

  @Expose({ name: "topic_modeling" })
  @Type(() => TopicModelingConfigModel)
  topicModeling?: TopicModelingConfigModel;

  // Multi categorical
  delimiter?: string;

  @Expose({ name: "is_json" })
  isJson?: boolean;

  // Geospatial
  role?: GeospatialRoleEnum;
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

  @Expose({ name: "data_schema" })
  @Type(() => ProjectSchemaManagerModel)
  dataSchema: ProjectSchemaManagerModel;
}
