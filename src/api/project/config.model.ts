import { DataSourceTypeEnum, DocumentEmbeddingMethodEnum, FillNaModeEnum, SchemaColumnTypeEnum } from "@/common/constants/enum";
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
  
  @Expose({ name: "min_df" })
  minDf: number;

  @Expose({ name: "max_df" })
  maxDf: number;

  @Expose({ name: "max_unique_words" })
  maxUniqueWords: number | null;

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

  @Expose({ name: "max_topics" })
  maxTopics: number | null;

  @Expose({ name: "n_gram_range" })
  nGramRange: [number, number];

  @Expose({ name: "seed_topics" })
  seedTopics: string[][] | null;

  @Expose({ name: "no_outliers" })
  noOutliers: boolean;

  @Expose({ name: "represent_outliers" })
  representOutliers: boolean;

  @Expose({name: "embedding_method"})
  embeddingMethod: DocumentEmbeddingMethodEnum;
}

export class ProjectSchemaModel {
  name: string;
  type: SchemaColumnTypeEnum;

  @Expose({name: "dataset_name"})
  datasetName: string | null;

  @Expose({name: "fill_na"})
  fillNa: FillNaModeEnum | null;

  @Expose({name: "fill_na_value"})
  fillNaValue?: string | number;

  // Continuous
  @Expose({ name: "lower_bound" })
  lowerBound?: number | null;

  @Expose({ name: "upper_bound" })
  upperBound?: number | null;

  // Categorical
  @Expose({ name: "min_frequency" })
  minFrequency?: number | null;

  // Temporal

  @Expose({ name: "min_date" })
  @Type(() => Date)
  minDate?: Date | null;

  @Expose({ name: "max_date" })
  @Type(() => Date)
  maxDate?: Date | null;

  bins?: number

  @Expose({ name: "datetime_format" })
  datetimeFormat?: string | null;

  // Textual
  @Type(() => TextPreprocessingConfigModel)
  preprocessing?: TextPreprocessingConfigModel

  @Expose({name: "topic_modeling"})
  @Type(() => TopicModelingConfigModel)
  topicModeling?: TopicModelingConfigModel
}


export class ProjectSchemaManagerModel {
  @Type(() => ProjectSchemaModel)
  columns: ProjectSchemaModel[];
}

export class ProjectConfigModel {
  @Expose({ name: "project_id" })
  projectId: string;

  @Type(() => ProjectDataSourceModel)
  source: ProjectDataSourceModel

  @Expose({name: "data_schema"})
  @Type(() => ProjectSchemaManagerModel)
  dataSchema: ProjectSchemaManagerModel;
}
