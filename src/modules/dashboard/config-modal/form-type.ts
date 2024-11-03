import { PROJECT_CONFIG_VERSION, ProjectConfigModel } from '@/api/project/config.model';
import { DataSourceTypeEnum, SchemaColumnTypeEnum } from '@/common/constants/enum';
import * as Yup from 'yup';

export const ProjectConfigColumnFormSchema = Yup.object({
  name: Yup.string().required(),
  datasetName: Yup.string().required(),
  type: Yup.string().oneOf(Object.values(SchemaColumnTypeEnum)).required(),

  lowerBound: Yup.number().nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  upperBound: Yup.number().nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }).moreThan(Yup.ref("lowerBound"), "For obvious reasons, the upper bound must be greater than the lower bound."),
  minFrequency: Yup.number().min(1).nullable().when("type", {
    is: SchemaColumnTypeEnum.Categorical,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  minDate: Yup.date().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  maxDate: Yup.date().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }).min(Yup.ref("minDate"), "For obvious reasons, the max date must be after min date."),
  bins: Yup.number().positive().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  datetimeFormat: Yup.string().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  preprocessing: Yup.object({
    ignoreTokens: Yup.array(Yup.string().required()).required(),
    stopwords: Yup.array(Yup.string().required()).required(),
    removeEmail: Yup.boolean().required(),
    removeUrl: Yup.boolean().required(),
    removeNumber: Yup.boolean().required(),
    minWordFrequency: Yup.number().positive().required(),
    maxWordFrequency: Yup.number().positive().required(),
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
    seedTopics: Yup.array(
      Yup.array(
        Yup.string().required()
      ).required()
    ).min(1).nullable()
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  })
});

export const ProjectConfigFormSchema = Yup.object({
  projectId: Yup.string().required().max(255).matches(
    /^[a-zA-Z0-9-_. ]+$/,
    "The project name must also be a valid file name."
  ),
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

export function DefaultProjectSchemaColumnValues(name: string, type: SchemaColumnTypeEnum){
  return {
    name,
    datasetName: name,
    type,
    preprocessing: type === SchemaColumnTypeEnum.Textual ? {
      ignoreTokens: [],
      removeEmail: true,
      removeNumber: true,
      removeUrl: true,
      stopwords: [],
      maxUniqueWords: 1_000_000,
      maxWordFrequency: 1 / 2,
      minWordFrequency: 5,
      minDocumentLength: 5,
      minWordLength: 3,
    } : undefined,
    topicModeling: type === SchemaColumnTypeEnum.Textual ? {
      lowMemory: false,
      maxTopics: null,
      maxTopicSize: 1 / 20,
      minTopicSize: 15,
      nGramRangeEnd: 2,
      nGramRangeStart: 1,
      noOutliers: false,
      representOutliers: false,
      seedTopics: null,
    } : undefined,
    bins: type === SchemaColumnTypeEnum.Temporal ? 10 : undefined,
    datetimeFormat: type === SchemaColumnTypeEnum.Temporal ? null : undefined,
    lowerBound: type === SchemaColumnTypeEnum.Continuous ? null : undefined,
    maxDate: type === SchemaColumnTypeEnum.Temporal ? null : undefined,
    minDate: type === SchemaColumnTypeEnum.Temporal ? null : undefined,
    minFrequency: type === SchemaColumnTypeEnum.Categorical ? 1 : undefined,
    upperBound: type === SchemaColumnTypeEnum.Continuous ? null : undefined
  } as ProjectConfigColumnFormType
}

export function ProjectConfigDefaultValues(data?: ProjectConfigModel): ProjectConfigFormType {
  return {
    columns: data?.dataSchema.columns.map(col => {
      return {
        name: col.name,
        datasetName: col.datasetName ?? col.name,
        type: col.type,
        bins: col.bins,
        datetimeFormat: col.datetimeFormat,
        lowerBound: col.lowerBound,
        maxDate: col.maxDate,
        minDate: col.minDate,
        minFrequency: col.minFrequency,
        upperBound: col.upperBound,
        preprocessing: col.preprocessing,
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
      limit: data?.source?.limit ?? null,
      sheetName: data?.source?.sheetName ?? '',
    }
  }
}

export function ProjectConfigFormType2Input(values: ProjectConfigFormType): ProjectConfigModel {
  return {
    ...values,
    version: PROJECT_CONFIG_VERSION,
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