import { ProjectConfigModel } from '@/api/project/model';
import { DataSourceTypeEnum, DocumentEmbeddingMethodEnum, DocumentPreprocessingMethodEnum, GeospatialRoleEnum, SchemaColumnTypeEnum } from '@/common/constants/enum';
import * as Yup from 'yup';

const FileNameSchema = Yup.string().required().max(255).matches(
  /^[a-zA-Z0-9-_. ]+$/,
  "This field must only contain letters, numbers, spaces, or the following special characters: \"-\", \"_\", and \".\""
);
export const ProjectConfigColumnFormSchema = Yup.object({
  name: FileNameSchema,
  alias: Yup.string().nullable(),
  type: Yup.string().oneOf(Object.values(SchemaColumnTypeEnum)).required(),

  binCount: Yup.number().positive().nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }),
  bins: Yup.array(Yup.number().required()).nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }).transform((value) => {
    if (Array.isArray(value)) {
      return value.sort((a, b) => a - b);
    }
    throw new Error("This field does not contain an array. This is most likely be a developer oversight.");
  }),

  categoryOrder: Yup.array(Yup.string().required()).when("type", {
    is: SchemaColumnTypeEnum.OrderedCategorical,
    otherwise: schema => schema.strip()
  }),

  datetimeFormat: Yup.string().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: schema => schema.strip(),
  }),

  isJson: Yup.boolean().nullable().when("type", {
    is: SchemaColumnTypeEnum.MultiCategorical,
    otherwise: schema => schema.strip(),
  }),
  delimiter: Yup.string().when("type", {
    is: SchemaColumnTypeEnum.MultiCategorical,
    then: schema => schema.when("isJson", {
      is: true,
      then: schema => schema.required(),
    }),
    otherwise: schema => schema.strip(),
  }),

  role: Yup.string().oneOf(Object.values(GeospatialRoleEnum)).when("type", {
    is: SchemaColumnTypeEnum.Geospatial,
    otherwise: schema => schema.strip(),
  }),

  preprocessing: Yup.object({
    pipelineType: Yup.string().oneOf(Object.values(DocumentPreprocessingMethodEnum)).required(),
    ignoreTokens: Yup.array(Yup.string().required()).required(),
    stopwords: Yup.array(Yup.string().required()).required(),
    removeEmail: Yup.boolean().required(),
    removeUrl: Yup.boolean().required(),
    removeNumber: Yup.boolean().required(),
    minDf: Yup.number().positive().required(),
    maxDf: Yup.number().positive().max(1).required(),
    maxUniqueWords: Yup.number().positive().required(),
    minDocumentLength: Yup.number().positive().required(),
    minWordLength: Yup.number().positive().required(),
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  topicModeling: Yup.object({
    lowMemory: Yup.boolean().required(),
    minTopicSize: Yup.number().positive().required(),
    maxTopicSize: Yup.number().nullable().moreThan(Yup.ref("minTopicSize")),
    maxTopics: Yup.number().nullable().positive(),
    nGramRangeStart: Yup.number().positive().required(),
    nGramRangeEnd: Yup.number().positive().required().moreThan(Yup.ref('nGramRangeStart')),
    noOutliers: Yup.boolean().required(),
    representOutliers: Yup.boolean().required(),
    embeddingMethod: Yup.string().oneOf(Object.values(DocumentEmbeddingMethodEnum)).required(),
    clusteringConservativeness: Yup.number().positive().max(1).required(),
    globalityConsideration: Yup.number().positive().nullable(),
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  })
});

export const ProjectConfigFormSchema = Yup.object({
  projectId: FileNameSchema,
  source: Yup.object({
    path: Yup.string().required().matches(/^[a-zA-Z0-9-_. :/\\]+$/, "Please provide a valid path"),
    type: Yup.string().oneOf(Object.values(DataSourceTypeEnum)).required(),
    sheetName: Yup.string().when("type", {
      is: DataSourceTypeEnum.Excel,
      then: schema => schema.required("Sheet name is required when the dataset type is Excel."),
      otherwise: schema => schema.strip(),
    }),
    delimiter: Yup.string().when("type", {
      is: DataSourceTypeEnum.CSV,
      then: schema => schema.required("Delimiter is required when the dataset type is CSV."),
      otherwise: schema => schema.strip(),
    }),
    limit: Yup.number().nullable().when("type", {
      is: DataSourceTypeEnum.CSV,
      otherwise: schema => schema.strip(),
    }),
  }).required(),
  columns: Yup.array().required()
})

export type ProjectConfigColumnFormType = Yup.InferType<typeof ProjectConfigColumnFormSchema>;
export type ProjectConfigFormType = Yup.InferType<typeof ProjectConfigFormSchema>;

export function DefaultProjectSchemaColumnValues(name: string, type: SchemaColumnTypeEnum) {
  return {
    name,
    type,
    alias: name,
    preprocessing: type === SchemaColumnTypeEnum.Textual ? {
      ignoreTokens: [],
      removeEmail: true,
      removeNumber: true,
      removeUrl: true,
      stopwords: [],
      maxUniqueWords: 1_000_000,
      maxDf: 1 / 2,
      minDf: 5,
      minDocumentLength: 5,
      minWordLength: 3,
      pipelineType: DocumentPreprocessingMethodEnum.English,
    } : undefined,
    topicModeling: type === SchemaColumnTypeEnum.Textual ? {
      lowMemory: false,
      maxTopics: null,
      maxTopicSize: 1 / 10,
      minTopicSize: 15,
      nGramRangeEnd: 2,
      nGramRangeStart: 1,
      noOutliers: false,
      representOutliers: false,
      embeddingMethod: DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2,
      clusteringConservativeness: 1,
      globalityConsideration: null,
    } : undefined,
    binCount: type === SchemaColumnTypeEnum.Continuous ? 3 : undefined,
    bins: null,
    categoryOrder: type === SchemaColumnTypeEnum.OrderedCategorical ? [] : undefined,
    delimiter: type === SchemaColumnTypeEnum.MultiCategorical ? ',' : undefined,
    isJson: type === SchemaColumnTypeEnum.MultiCategorical ? false : undefined,
    role: type === SchemaColumnTypeEnum.Geospatial ? (name.startsWith('long') || name.startsWith('lng') ? GeospatialRoleEnum.Longitude : GeospatialRoleEnum.Latitude) : undefined,
    datetimeFormat: type === SchemaColumnTypeEnum.Temporal ? null : undefined,
  } as ProjectConfigColumnFormType
}

export function ProjectConfigDefaultValues(data?: ProjectConfigModel): ProjectConfigFormType {
  return {
    columns: data?.dataSchema.columns.map(col => {
      return {
        ...col,
        topicModeling: col.topicModeling ? {
          ...col.topicModeling,
          nGramRangeStart: col.topicModeling.nGramRange[0],
          nGramRangeEnd: col.topicModeling.nGramRange[1],
        } : undefined,
      } as ProjectConfigColumnFormType;
    }) ?? [],
    projectId: data?.projectId ?? '',
    source: {
      path: data?.source?.path ?? '',
      type: data?.source?.type ?? undefined as any,
      delimiter: data?.source?.delimiter ?? ',',
      sheetName: data?.source?.sheetName ?? '',
    }
  }
}

export function ProjectConfigFormType2Input(values: ProjectConfigFormType): ProjectConfigModel {
  return {
    ...values,
    version: 1,
    dataSchema: {
      columns: values.columns.map(col => {
        return {
          ...col,
          topicModeling: col.topicModeling ? {
            ...col.topicModeling,
            nGramRange: [col.topicModeling.nGramRangeStart, col.topicModeling.nGramRangeEnd]
          } : undefined,
        }
      }),
    }
  }
}