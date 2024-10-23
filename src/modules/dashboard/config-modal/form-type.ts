import { PROJECT_CONFIG_VERSION, ProjectConfigModel } from '@/api/project/config.model';
import { DataSourceTypeEnum, SchemaColumnTypeEnum } from '@/common/constants/enum';
import * as Yup from 'yup';

export const ProjectConfigFormSchema = Yup.object({
  projectId: Yup.string().required().max(255).matches(
    /^[a-zA-Z0-9-_. ]+$/,
    "The project name must also be a valid file name."
  ),
  source: Yup.object({
    path: Yup.string().required().matches(/^[a-zA-Z0-9-_. /\/]+$/, "Please provide a valid path"),
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
  columns: Yup.array(Yup.object({
    name: Yup.string().required(),
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
    }).when("type", {
      is: SchemaColumnTypeEnum.Textual,
      then: schema => schema.required(),
      otherwise: schema => schema.strip(),
    }),
    topicModeling: Yup.object({
      lowMemory: Yup.boolean().required(),
      minTopicSize: Yup.number().positive().required(),
      maxTopicSize: Yup.number().required().moreThan(Yup.ref("minTopicSize")),
      maxTopics: Yup.number().positive().required(),
      nGramRangeStart: Yup.number().positive().required(),
      nGramRangeEnd: Yup.number().positive().required().moreThan(Yup.ref('nGramRangeStart')),
      noOutliers: Yup.boolean().required(),
      representOutliers: Yup.boolean().required(),
      seedTopics: Yup.array(
        Yup.array(
          Yup.string().required()
        ).required()
      ).min(1).nullable().required()
    }).when("type", {
      is: SchemaColumnTypeEnum.Textual,
      then: schema => schema.required(),
      otherwise: schema => schema.strip(),
    })
  })).required()
})

export type ProjectConfigFormType = Yup.InferType<typeof ProjectConfigFormSchema>;

export function ProjectConfigDefaultValues(data?: ProjectConfigModel): ProjectConfigFormType {
  return {
    columns: data?.dfschema.columns.map(col => {
      return {
        name: col.name,
        preprocessing: col.preprocessing as any,
        topicModeling: col.topicModeling as any,
        type: col.type,
        bins: col.bins,
        datetimeFormat: col.datetimeFormat,
        lowerBound: col.lowerBound,
        maxDate: col.maxDate,
        minDate: col.minDate,
        minFrequency: col.minFrequency,
        upperBound: col.upperBound
      };
    }) ?? [],
    projectId: data?.projectId ?? '',
    source: {
      path: data?.source?.path ?? '',
      type: data?.source?.type ?? DataSourceTypeEnum.CSV,
      delimiter: data?.source?.delimiter ?? ',',
      limit: data?.source?.limit ?? null,
      sheetName: data?.source?.sheetName,
    }
  }
}

export function ProjectConfigFormType2Input(values: ProjectConfigFormType): ProjectConfigModel {
  return {
    ...values,
    version: PROJECT_CONFIG_VERSION,
    dfschema: {
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