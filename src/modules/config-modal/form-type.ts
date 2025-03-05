import { ProjectConfigModel } from '@/api/project/model';
import { DataSourceTypeEnum, DocumentEmbeddingMethodEnum, DocumentPreprocessingMethodEnum, GeospatialRoleEnum, SchemaColumnTypeEnum } from '@/common/constants/enum';
import * as Yup from 'yup';

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

  binCount: Yup.number().positive().transform(nullIfNaN).nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }),
  bins: Yup.array(Yup.number().required()).transform(nullIfEmpty).nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }).transform((value) => {
    if (Array.isArray(value)) {
      return value.sort((a, b) => a - b);
    }
    throw new Error("This field does not contain an array. This is most likely be a developer oversight.");
  }).min(1),

  categoryOrder: Yup.array(Yup.string().required()).when("type", {
    is: SchemaColumnTypeEnum.OrderedCategorical,
    otherwise: schema => schema.strip()
  }),

  datetimeFormat: Yup.string().transform(nullIfEmpty).nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: schema => schema.strip(),
  }),

  isJson: Yup.boolean().required().when("type", {
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
    maxTopicSize: Yup.number().transform(nullIfNaN).nullable().moreThan(Yup.ref("minTopicSize")),
    maxTopics: Yup.number().transform(nullIfNaN).nullable().positive(),
    nGramRangeStart: Yup.number().positive().required(),
    nGramRangeEnd: Yup.number().positive().required().moreThan(Yup.ref('nGramRangeStart')),
    noOutliers: Yup.boolean().required(),
    representOutliers: Yup.boolean().required(),
    embeddingMethod: Yup.string().oneOf(Object.values(DocumentEmbeddingMethodEnum)).required(),
    clusteringConservativeness: Yup.number().positive().max(1).required(),
    globalityConsideration: Yup.number().positive().transform(nullIfNaN).nullable(),
    superTopicSimilarity: Yup.number().min(0).max(1).required(),
    topNWords: Yup.number().min(3).required(),
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  })
});

export const ProjectConfigFormSchema = Yup.object({
  // No need for validation. BE should compute a file path using the hash of the project ID.
  // This means that we don't have to make sure that project id is a valid file path.
  // Same principle applies to column names
  projectId: Yup.string().required(),
  source: Yup.object({
    // Can't guarantee this though. But we have a check-dataset endpoint so... might be alright?
    path: Yup.string().required(),
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
  }).required(),
  columns: Yup.array(ProjectConfigColumnFormSchema.required()).required()
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
      superTopicSimilarity: 0.7,
      topNWords: 50,
    } : undefined,
    binCount: type === SchemaColumnTypeEnum.Continuous ? 3 : null,
    bins: null,
    categoryOrder: type === SchemaColumnTypeEnum.OrderedCategorical ? [] : null,
    delimiter: type === SchemaColumnTypeEnum.MultiCategorical ? ',' : null,
    isJson: type === SchemaColumnTypeEnum.MultiCategorical ? false : null,
    role: type === SchemaColumnTypeEnum.Geospatial ? (name.startsWith('long') || name.startsWith('lng') ? GeospatialRoleEnum.Longitude : GeospatialRoleEnum.Latitude) : undefined,
    datetimeFormat: null,
  } as ProjectConfigColumnFormType;
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
          alias: col.alias ?? null,
          topicModeling: col.topicModeling ? {
            ...col.topicModeling,
            maxTopicSize: col.topicModeling.maxTopicSize ?? null,
            globalityConsideration: col.topicModeling.globalityConsideration ?? null,
            maxTopics: col.topicModeling.maxTopics ?? null,
            nGramRange: [col.topicModeling.nGramRangeStart, col.topicModeling.nGramRangeEnd]
          } : undefined,
        }
      }),
    }
  }
}