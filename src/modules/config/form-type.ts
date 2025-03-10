import { components } from '@/api/openapi';
import { ProjectConfigModel, ProjectMutationInput } from '@/api/project';
import {
  DataSourceTypeEnum,
  DocumentEmbeddingMethodEnum,
  DocumentPreprocessingMethodEnum,
  GeospatialRoleEnum,
  SchemaColumnTypeEnum,
} from '@/common/constants/enum';
import * as Yup from 'yup';
import { transformDataSourceFormType2DataSourceInput } from './columns/utils';

function nullIfNaN(value: number): number | null {
  return value === Number(value) ? value : null;
}

function nullIfEmpty(value: any): any | null {
  return value || null;
}

export const ProjectConfigColumnFormSchema = Yup.object({
  name: Yup.string().required(),
  alias: Yup.string().nullable().required(),
  type: Yup.string().oneOf(Object.values(SchemaColumnTypeEnum)).required(),

  bin_count: Yup.number()
    .positive()
    .transform(nullIfNaN)
    .nullable()
    .when('type', {
      is: SchemaColumnTypeEnum.Continuous,
      otherwise: (schema) => schema.strip(),
    }),
  bins: Yup.array(Yup.number().required())
    .transform(nullIfEmpty)
    .nullable()
    .when('type', {
      is: SchemaColumnTypeEnum.Continuous,
      otherwise: (schema) => schema.strip(),
    })
    .transform((value) => {
      if (Array.isArray(value)) {
        return value.sort((a, b) => a - b);
      }
      throw new Error(
        'This field does not contain an array. This is most likely be a developer oversight.',
      );
    })
    .min(1),

  category_order: Yup.array(Yup.string().required())
    .nullable()
    .when('type', {
      is: SchemaColumnTypeEnum.OrderedCategorical,
      otherwise: (schema) => schema.strip(),
    }),

  datetime_format: Yup.string()
    .transform(nullIfEmpty)
    .nullable()
    .when('type', {
      is: SchemaColumnTypeEnum.Temporal,
      otherwise: (schema) => schema.strip(),
    }),

  is_json: Yup.boolean()
    .required()
    .when('type', {
      is: SchemaColumnTypeEnum.MultiCategorical,
      otherwise: (schema) => schema.strip(),
    }),

  delimiter: Yup.string().when('type', {
    is: SchemaColumnTypeEnum.MultiCategorical,
    then: (schema) =>
      schema.when('isJson', {
        is: true,
        then: (schema) => schema.required(),
      }),
    otherwise: (schema) => schema.strip(),
  }),

  role: Yup.string()
    .oneOf(Object.values(GeospatialRoleEnum))
    .when('type', {
      is: SchemaColumnTypeEnum.Geospatial,
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
  }).when('type', {
    is: SchemaColumnTypeEnum.Textual,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
  topic_modeling: Yup.object({
    min_topic_size: Yup.number().positive().required(),
    max_topic_size: Yup.number()
      .transform(nullIfNaN)
      .nullable()
      .moreThan(Yup.ref('minTopicSize')),
    max_topics: Yup.number().transform(nullIfNaN).nullable().positive(),
    n_gram_range_start: Yup.number().positive().required(),
    n_gram_range_end: Yup.number()
      .positive()
      .required()
      .moreThan(Yup.ref('nGramRangeStart')),
    no_outliers: Yup.boolean().required(),
    represent_outliers: Yup.boolean().required(),
    embedding_method: Yup.string()
      .oneOf(Object.values(DocumentEmbeddingMethodEnum))
      .required(),
    clustering_conservativeness: Yup.number().positive().max(1).required(),
    globality_consideration: Yup.number()
      .positive()
      .transform(nullIfNaN)
      .nullable(),
    top_n_words: Yup.number().min(3).required(),
  }).when('type', {
    is: SchemaColumnTypeEnum.Textual,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.strip(),
  }),
});

export const ProjectConfigFormSchema = Yup.object({
  // No need for validation. BE should compute a file path using the hash of the project ID.
  // This means that we don't have to make sure that project id is a valid file path.
  // Same principle applies to column names
  project_id: Yup.string().required(),
  source: Yup.object({
    // Can't guarantee this though. But we have a check-dataset endpoint so... might be alright?
    path: Yup.string().required(),
    type: Yup.string().oneOf(Object.values(DataSourceTypeEnum)).required(),
    sheet_name: Yup.string()
      .transform(nullIfEmpty)
      .nullable()
      .when('type', {
        is: DataSourceTypeEnum.Excel,
        otherwise: (schema) => schema.strip(),
      }),
    delimiter: Yup.string().when('type', {
      is: DataSourceTypeEnum.CSV,
      then: (schema) =>
        schema.required('Delimiter is required when the dataset type is CSV.'),
      otherwise: (schema) => schema.strip(),
    }),
  }).required(),
  columns: Yup.array(ProjectConfigColumnFormSchema.required()).required(),
});

export type ProjectConfigColumnFormType = Yup.InferType<
  typeof ProjectConfigColumnFormSchema
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
    alias: name,
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
            min_document_length: 5,
            min_word_length: 3,
            pipeline_type: DocumentPreprocessingMethodEnum.English,
          }
        : undefined,
    topic_modeling:
      type === SchemaColumnTypeEnum.Textual
        ? {
            max_topics: null,
            max_topic_size: 1 / 5,
            min_topic_size: 15,
            n_gram_range_end: 2,
            n_gram_range_start: 1,
            no_outliers: false,
            represent_outliers: false,
            embedding_method: DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2,
            clustering_conservativeness: 1,
            globality_consideration: null,
            top_n_words: 50,
          }
        : undefined,
    bin_count: type === SchemaColumnTypeEnum.Continuous ? 3 : null,
    bins: null,
    category_order:
      type === SchemaColumnTypeEnum.OrderedCategorical ? [] : null,
    delimiter: type === SchemaColumnTypeEnum.MultiCategorical ? ',' : null,
    is_json: type === SchemaColumnTypeEnum.MultiCategorical ? false : null,
    role:
      type === SchemaColumnTypeEnum.Geospatial
        ? name.startsWith('long') || name.startsWith('lng')
          ? GeospatialRoleEnum.Longitude
          : GeospatialRoleEnum.Latitude
        : undefined,
    datetime_format: null,
  } as ProjectConfigColumnFormType;
}

export function ProjectConfigDefaultValues(
  data?: ProjectConfigModel,
): ProjectConfigFormType {
  return {
    columns:
      data?.data_schema.columns.map((col) => {
        return {
          bin_count: 'bin_count' in col ? col.bin_count : 3,
          bins: 'bins' in col ? col.bins : null,
          datetime_format:
            'datetime_format' in col ? col.datetime_format : null,
          name: col.name,
          alias: col.alias,
          is_json: 'is_json' in col ? col.is_json : false,
          preprocessing:
            'preprocessing' in col
              ? {
                  ...col.preprocessing,
                }
              : undefined,
          type: col.type,
          category_order: 'category_order' in col ? col.category_order : null,
          delimiter: 'delimiter' in col ? col.delimiter : ',',
          role: 'role' in col ? col.role : GeospatialRoleEnum.Latitude,
          topic_modeling:
            'topic_modeling' in col
              ? {
                  ...col.topic_modeling,
                  n_gram_range_start: col.topic_modeling.n_gram_range[0],
                  n_gram_range_end: col.topic_modeling.n_gram_range[1],
                }
              : undefined,
        } as ProjectConfigColumnFormType;
      }) ?? [],
    project_id: data?.project_id ?? '',
    source: {
      path: data?.source?.path ?? '',
      type: data?.source?.type ?? (undefined as any),
      delimiter:
        data?.source && 'delimiter' in data.source
          ? data.source.delimiter
          : ',',
      sheet_name:
        data?.source && 'sheet_name' in data.source
          ? data.source.sheet_name
          : '',
    },
  };
}

export function ProjectConfigFormType2Input(
  values: ProjectConfigFormType,
): ProjectMutationInput {
  return {
    source: transformDataSourceFormType2DataSourceInput(values.source),
    version: 1,
    project_id: values.project_id,
    data_schema: {
      columns: values.columns.map((col) => {
        const basicColumn = {
          alias: col.alias ?? null,
          name: col.name,
          internal: false,
        };
        const type = col.type;
        switch (type) {
          case SchemaColumnTypeEnum.Categorical:
            return {
              ...basicColumn,
              type,
            } as components['schemas']['CategoricalSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Geospatial:
            return {
              ...basicColumn,
              type,
              role: col.role!,
            } as components['schemas']['GeospatialSchemaColumn-Input'];
          case SchemaColumnTypeEnum.MultiCategorical:
            return {
              ...basicColumn,
              type,
              is_json: col.is_json!,
              delimiter: col.delimiter!,
            } as components['schemas']['MultiCategoricalSchemaColumn-Input'];
          case SchemaColumnTypeEnum.OrderedCategorical:
            return {
              ...basicColumn,
              type,
              category_order: col.category_order!,
            } as components['schemas']['OrderedCategoricalSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Temporal:
            return {
              ...basicColumn,
              type,
              datetime_format: col.datetime_format!,
            } as components['schemas']['TemporalSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Continuous:
            return {
              ...basicColumn,
              type,
              bin_count: col.bin_count!,
              bins: col.bins!,
            } as components['schemas']['ContinuousSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Textual:
            return {
              ...basicColumn,
              type,
              topic_modeling: {
                ...col.topic_modeling!,
                max_topic_size: col.topic_modeling.max_topic_size ?? null,
                globality_consideration:
                  col.topic_modeling.globality_consideration ?? null,
                max_topics: col.topic_modeling.max_topics ?? null,
                n_gram_range: [
                  col.topic_modeling.n_gram_range_start,
                  col.topic_modeling.n_gram_range_end,
                ],
              },
              preprocessing: col.preprocessing!,
            } as components['schemas']['TextualSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Topic:
            return {
              ...basicColumn,
              type,
            } as components['schemas']['TopicSchemaColumn-Input'];
          case SchemaColumnTypeEnum.Unique:
            return {
              ...basicColumn,
              type,
            } as components['schemas']['UniqueSchemaColumn-Input'];
        }
      }),
    },
  };
}
