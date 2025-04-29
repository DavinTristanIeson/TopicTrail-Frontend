import {
  ProjectConfigModel,
  ProjectDataSourceModel,
  ProjectMutationInput,
} from '@/api/project';
import {
  DataSourceTypeEnum,
  DocumentEmbeddingMethodEnum,
  DocumentPreprocessingMethodEnum,
  GeospatialRoleEnum,
  SchemaColumnTypeEnum,
  TemporalColumnFeatureEnum,
} from '@/common/constants/enum';
import * as Yup from 'yup';
import {
  yupNullableArray,
  yupNullableNumber,
  yupNullableString,
} from '@/common/utils/form';

export const ProjectConfigColumnFormSchema = Yup.object({
  name: Yup.string().required(),
  description: yupNullableString,
  type: yupNullableString.oneOf(Object.values(SchemaColumnTypeEnum)),
  bin_count: yupNullableNumber.positive().when('type', {
    is: SchemaColumnTypeEnum.Continuous,
    then: (schema) =>
      schema.when('bins', {
        is: null,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.strip(),
      }),
    otherwise: (schema) => schema.strip(),
  }),
  bins: yupNullableArray.of(Yup.number().required()).when('type', {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: (schema) => schema.strip(),
  }),

  category_order: yupNullableArray.of(Yup.string().required()).when('type', {
    is: SchemaColumnTypeEnum.OrderedCategorical,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),

  datetime_format: yupNullableString.when('type', {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: (schema) => schema.strip(),
  }),
  temporal_features: yupNullableArray.when('type', {
    is: SchemaColumnTypeEnum.Temporal,
    then: (schema) =>
      schema
        .of(
          Yup.string()
            .oneOf(Object.values(TemporalColumnFeatureEnum))
            .required(),
        )
        .required(),
    otherwise: (schema) => schema.strip(),
  }),

  role: yupNullableString.when('type', {
    is: SchemaColumnTypeEnum.Geospatial,
    then: (schema) => schema.oneOf(Object.values(GeospatialRoleEnum)),
    otherwise: (schema) => schema.strip(),
  }),

  preprocessing: Yup.object({
    pipeline_type: Yup.string()
      .oneOf(Object.values(DocumentPreprocessingMethodEnum))
      .required(),
    ignore_tokens: Yup.array(Yup.string().required()).required(),
    stopwords: Yup.array(Yup.string().required()).required(),
    remove_email: Yup.boolean().required(),
    remove_url: Yup.boolean().required(),
    remove_number: Yup.boolean().required(),
    min_df: Yup.number().positive().required(),
    max_df: Yup.number().positive().max(1).required(),
    max_unique_words: Yup.number().positive().required(),
    min_document_length: Yup.number().positive().required(),
    min_word_length: Yup.number().positive().required(),
    n_gram_range: Yup.array(Yup.number().positive().required())
      .required()
      .length(2),
  }).when('type', {
    is: SchemaColumnTypeEnum.Textual,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
  topic_modeling: Yup.object({
    min_topic_size: Yup.number().positive().required(),
    max_topic_size: yupNullableNumber,
    max_topics: yupNullableNumber.positive(),
    no_outliers: Yup.boolean().required(),
    represent_outliers: Yup.boolean().required(),
    embedding_method: Yup.string()
      .oneOf(Object.values(DocumentEmbeddingMethodEnum))
      .required(),
    clustering_conservativeness: Yup.number().positive().max(1).required(),
    reference_document_count: Yup.number().required().positive(),
    top_n_words: Yup.number().min(3).required(),
  }).when('type', {
    is: SchemaColumnTypeEnum.Textual,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
});

export const ProjectConfigMetadataSchema = Yup.object({
  name: Yup.string().required(),
  description: yupNullableString,
  tags: Yup.array(Yup.string().required()).required(),
}).required();

export const ProjectConfigDataSourceFormSchema = Yup.object({
  path: Yup.string().required(),
  type: Yup.string().oneOf(Object.values(DataSourceTypeEnum)).required(),
  sheet_name: yupNullableString.when('type', {
    is: DataSourceTypeEnum.Excel,
    otherwise: (schema) => schema.strip(),
  }),
  delimiter: Yup.string().when('type', {
    is: DataSourceTypeEnum.CSV,
    then: (schema) =>
      schema.required('Delimiter is required when the dataset type is CSV.'),
    otherwise: (schema) => schema.strip(),
  }),
}).required();

export const ProjectConfigFormSchema = Yup.object({
  metadata: ProjectConfigMetadataSchema,
  source: ProjectConfigDataSourceFormSchema,
  columns: Yup.array(ProjectConfigColumnFormSchema.required()).required(),
});

export type ProjectConfigColumnFormType = Yup.InferType<
  typeof ProjectConfigColumnFormSchema
>;
export type ProjectConfigDataSourceFormType = Yup.InferType<
  typeof ProjectConfigDataSourceFormSchema
>;
export type ProjectConfigFormType = Yup.InferType<
  typeof ProjectConfigFormSchema
>;

export function DefaultProjectSchemaColumnValues(
  name: string,
  type: SchemaColumnTypeEnum,
) {
  return {
    name,
    type,
    description: null,
    preprocessing:
      type === SchemaColumnTypeEnum.Textual
        ? {
            ignore_tokens: [],
            remove_email: true,
            remove_number: true,
            remove_url: true,
            stopwords: [],
            max_unique_words: 1_000_000,
            max_df: 1 / 2,
            min_df: 5,
            min_document_length: 3,
            min_word_length: 3,
            n_gram_range: [1, 2],
            pipeline_type: DocumentPreprocessingMethodEnum.English,
          }
        : undefined,
    topic_modeling:
      type === SchemaColumnTypeEnum.Textual
        ? {
            max_topics: null,
            max_topic_size: null,
            min_topic_size: 15,
            no_outliers: false,
            represent_outliers: false,
            embedding_method: DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2,
            clustering_conservativeness: 1,
            reference_document_count: 15,
            top_n_words: 50,
          }
        : undefined,
    bin_count: type === SchemaColumnTypeEnum.Continuous ? 3 : null,
    bins: null,
    category_order:
      type === SchemaColumnTypeEnum.OrderedCategorical ? [] : null,
    role:
      type === SchemaColumnTypeEnum.Geospatial
        ? name.startsWith('long') || name.startsWith('lng')
          ? GeospatialRoleEnum.Longitude
          : GeospatialRoleEnum.Latitude
        : undefined,
    datetime_format: null,
    temporal_features:
      type === SchemaColumnTypeEnum.Temporal
        ? [
            TemporalColumnFeatureEnum.Year,
            TemporalColumnFeatureEnum.Month,
            TemporalColumnFeatureEnum.Monthly,
          ]
        : null,
  } as ProjectConfigColumnFormType;
}

export function ProjectConfigDefaultValues(
  data?: ProjectConfigModel,
): ProjectConfigFormType {
  if (data) {
    return {
      columns: data.data_schema.columns.filter((column) => !column.internal),
      metadata: data.metadata,
      source: data.source,
    } as ProjectConfigFormType;
  }
  return {
    columns: [],
    metadata: {
      name: '',
      description: null,
      tags: [],
    },
    source: {
      path: '',
      type: DataSourceTypeEnum.CSV,
      delimiter: ',',
      sheet_name: '',
    },
  };
}

export function ProjectConfigFormType2Input(
  values: ProjectConfigFormType,
): ProjectMutationInput {
  return {
    source: values.source as ProjectDataSourceModel,
    metadata: values.metadata,
    data_schema: {
      columns: values.columns,
    },
  } as unknown as ProjectMutationInput;
}
