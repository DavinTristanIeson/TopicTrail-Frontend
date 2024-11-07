import { ProjectDatasetInferredColumnModel } from '@/api/project';
import { ProjectConfigModel } from '@/api/project/config.model';
import { DataSourceTypeEnum, DocumentEmbeddingMethodEnum, FillNaModeEnum, SchemaColumnTypeEnum } from '@/common/constants/enum';
import * as Yup from 'yup';

export const ProjectConfigColumnFormSchema = () => Yup.object({
  name: Yup.string().required(),
  datasetName: Yup.string().required(),
  type: Yup.string().oneOf(Object.values(SchemaColumnTypeEnum)).required(),

  lowerBound: Yup.number().nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }),
  upperBound: Yup.number().nullable().when("type", {
    is: SchemaColumnTypeEnum.Continuous,
    otherwise: schema => schema.strip(),
  }).moreThan(Yup.ref("lowerBound"), "For obvious reasons, the upper bound must be greater than the lower bound."),
  minFrequency: Yup.number().min(1).when("type", {
    is: SchemaColumnTypeEnum.Categorical,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  minDate: Yup.date().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: schema => schema.strip(),
  }),
  maxDate: Yup.date().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: schema => schema.strip(),
  }).min(Yup.ref("minDate"), "For obvious reasons, the max date must be after min date."),
  bins: Yup.number().positive().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  datetimeFormat: Yup.string().nullable().when("type", {
    is: SchemaColumnTypeEnum.Temporal,
    otherwise: schema => schema.strip(),
  }),
  fillNa: Yup.string().oneOf(Object.values(FillNaModeEnum)).nullable(),
  fillNaValue: Yup.mixed().when("fillNa", {
    is: FillNaModeEnum.Value,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  preprocessing: Yup.object({
    ignoreTokens: Yup.array(Yup.string().required()).required(),
    stopwords: Yup.array(Yup.string().required()).required(),
    removeEmail: Yup.boolean().required(),
    removeUrl: Yup.boolean().required(),
    removeNumber: Yup.boolean().required(),
    minDf: Yup.number().positive().required(),
    maxDf: Yup.number().positive().required(),
    maxUniqueWords: Yup.number().positive().nullable(),
    minDocumentLength: Yup.number().positive().required(),
    minWordLength: Yup.number().positive().required(),
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  }),
  topicModeling: Yup.object({
    lowMemory: Yup.boolean().required(),
    minTopicSize: Yup.number().min(2).required(),
    maxTopicSize: Yup.number().nullable(),
    maxTopics: Yup.number().nullable().positive(),
    nGramRangeStart: Yup.number().positive().required(),
    nGramRangeEnd: Yup.number().positive().required().moreThan(Yup.ref('nGramRangeStart')),
    noOutliers: Yup.boolean().required(),
    representOutliers: Yup.boolean().required(),
    seedTopics: Yup.array(
      Yup.array(
        Yup.string().required()
      ).required()
    ).min(1).nullable(),
    embeddingMethod: Yup.string().oneOf(Object.values(DocumentEmbeddingMethodEnum)).required(),
  }).when("type", {
    is: SchemaColumnTypeEnum.Textual,
    then: schema => schema.required(),
    otherwise: schema => schema.strip(),
  })
});

export const ProjectConfigFormSchema = () => Yup.object({
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
  columns: Yup.array(ProjectConfigColumnFormSchema()).required()
})

export type ProjectConfigColumnFormType = Yup.InferType<ReturnType<typeof ProjectConfigColumnFormSchema>>;
export type ProjectConfigFormType = Yup.InferType<ReturnType<typeof ProjectConfigFormSchema>>;

export function DefaultProjectSchemaColumnValues(column: ProjectDatasetInferredColumnModel){
  return {
    name: column.name,
    datasetName: column.name,
    type: column.type,
    fillNa: FillNaModeEnum.Exclude,
    fillNaValue: null as any,
    preprocessing: column.type === SchemaColumnTypeEnum.Textual ? {
      ignoreTokens: [],
      removeEmail: true,
      removeNumber: true,
      removeUrl: true,
      stopwords: [],
      maxUniqueWords: null,
      maxDf: 1 / 2,
      minDf: column.minDf ?? 5,
      minDocumentLength: column.minDocumentLength ?? 5,
      minWordLength: 3,
    } : null,
    topicModeling: column.type === SchemaColumnTypeEnum.Textual ? {
      lowMemory: false,
      maxTopics: null,
      maxTopicSize: 1 / 5,
      minTopicSize: column.minTopicSize ?? 15,
      nGramRangeStart: 1,
      nGramRangeEnd: 2,
      noOutliers: false,
      representOutliers: false,
      seedTopics: null,
      embeddingMethod: column.embeddingMethod ?? DocumentEmbeddingMethodEnum.Doc2Vec,
    } : null,
    bins: 10,
    datetimeFormat: null,
    lowerBound: null,
    maxDate: null,
    minDate: null,
    minFrequency: 1,
    upperBound: null,
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
        fillNa: col.fillNa,
        fillNaValue: col.fillNaValue,
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
      type: data?.source?.type ?? DataSourceTypeEnum.CSV,
      delimiter: data?.source?.delimiter ?? ',',
      limit: data?.source?.limit ?? null,
      sheetName: data?.source?.sheetName ?? '',
    }
  }
}

export function ProjectConfigFormType2Input(values: ProjectConfigFormType): ProjectConfigModel {
  return {
    ...values,
    dataSchema: {
      columns: values.columns.map(col => {
        return {
          ...col,
          fillNa: col.fillNa ?? null,
          fillNaValue: (col.fillNaValue ?? undefined) as string | number | undefined,
          preprocessing: col.preprocessing ? {
            ...col.preprocessing,
            maxUniqueWords: col.preprocessing.maxUniqueWords ?? null,
          } : undefined,
          topicModeling: col.topicModeling ? {
            ...col.topicModeling,
            maxTopicSize: col.topicModeling.maxTopicSize ?? null,
            maxTopics: col.topicModeling.maxTopics ?? null,
            seedTopics: col.topicModeling.seedTopics ?? null,
            nGramRange: [col.topicModeling.nGramRangeStart, col.topicModeling.nGramRangeEnd]
          } : undefined,
        }
      }),
    }
  }
}