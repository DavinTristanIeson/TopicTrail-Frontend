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

function nullIfEmptyArray(value: any): any | null {
  if (!value || value?.length === 0) {
    return null;
  }
  return value;
}

export const ProjectConfigColumnFormSchema = Yup.object({
  name: Yup.string().required(),
  alias: Yup.string().transform(nullIfEmpty).nullable(),
  type: Yup.string()
    .oneOf(Object.values(SchemaColumnTypeEnum))
    .transform(nullIfEmptyArray)
    .nullable(),

  bin_count: Yup.number()
    .positive()
    .transform(nullIfNaN)
    .nullable()
    .when('type', {
      is: SchemaColumnTypeEnum.Continuous,
      otherwise: (schema) => schema.strip(),
    }),
  bins: Yup.array(Yup.number().required())
    .transform(nullIfEmptyArray)
    .nullable()
    .transform((value) => {
      if (Array.isArray(value)) {
        return value.sort((a, b) => a - b);
      } else {
        return value;
      }
    })
    .when('type', {
      is: SchemaColumnTypeEnum.Continuous,
      then: (schema) =>
        schema.when('bin_count', {
          is: null,
          then: (schema) => schema.min(1).required(),
          otherwise: (schema) => schema.strip(),
        }),
      otherwise: (schema) => schema.strip(),
    }),

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

  is_json: Yup.boolean().when('type', {
    is: SchemaColumnTypeEnum.MultiCategorical,
    then: (schema) => schema.required(),
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
      .when({
        is: null,
        otherwise: (schema) => schema.moreThan(Yup.ref('min_topic_size')),
      }),
    max_topics: Yup.number().transform(nullIfNaN).nullable().positive(),
    n_gram_range: Yup.array(Yup.number().positive().required())
      .required()
      .length(2),
    no_outliers: Yup.boolean().required(),
    represent_outliers: Yup.boolean().required(),
    embedding_method: Yup.string()
      .oneOf(Object.values(DocumentEmbeddingMethodEnum))
      .required(),
    clustering_conservativeness: Yup.number().positive().max(1).required(),
    reference_document_count: Yup.number()
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

export const ProjectConfigMetadataSchema = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().nullable().transform(nullIfEmpty),
  tags: Yup.array(Yup.string().required()).required(),
}).required();

export const ProjectConfigDataSourceFormSchema = Yup.object({
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

export const ProjectConfigDataSourceUpdateModalFormSchema = Yup.object({
  source: ProjectConfigDataSourceFormSchema,
});
export type ProjectConfigDataSourceUpdateModalFormType = Yup.InferType<
  typeof ProjectConfigDataSourceUpdateModalFormSchema
>;

export function DefaultProjectSchemaColumnValues(
  name: string,
  type: SchemaColumnTypeEnum,
) {
  return {
    name,
    type,
    alias: null,
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
            max_topic_size: null,
            min_topic_size: 15,
            n_gram_range: [1, 2],
            no_outliers: false,
            represent_outliers: false,
            embedding_method: DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2,
            clustering_conservativeness: 1,
            reference_document_count: null,
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
          bin_count: 'bin_count' in col ? col.bin_count : null,
          bins: 'bins' in col ? col.bins : null,
          datetime_format:
            'datetime_format' in col ? col.datetime_format : null,
          name: col.name,
          alias: col.alias,
          is_json: 'is_json' in col ? col.is_json : null,
          preprocessing:
            'preprocessing' in col
              ? {
                  ...col.preprocessing,
                }
              : undefined,
          type: col.type,
          category_order: 'category_order' in col ? col.category_order : null,
          delimiter: 'delimiter' in col ? col.delimiter : null,
          role: 'role' in col ? col.role : null,
          topic_modeling:
            'topic_modeling' in col
              ? {
                  ...col.topic_modeling,
                }
              : undefined,
        } as ProjectConfigColumnFormType;
      }) ?? [],
    metadata: {
      name: data?.metadata.name ?? '',
      description: data?.metadata.description ?? null,
      tags: data?.metadata.tags ?? [],
    },
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
    metadata: {
      name: values.metadata.name,
      tags: values.metadata.tags ?? [],
      description: values.metadata.description ?? null,
    },
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
                reference_document_count:
                  col.topic_modeling.reference_document_count ?? null,
                max_topics: col.topic_modeling.max_topics ?? null,
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
    } as components['schemas']['SchemaManager-Input'],
  };
}
