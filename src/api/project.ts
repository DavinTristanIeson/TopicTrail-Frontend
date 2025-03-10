import { queryClient } from '@/common/api/query-client';
import { components } from './openapi';
import { Query } from '@tanstack/react-query';

export type ProjectLiteModel = components['schemas']['ProjectLiteResource'];
export type ProjectModel = components['schemas']['ProjectResource'];
export type ProjectConfigModel = components['schemas']['Config-Output'];
export type ProjectDataSourceModel =
  | components['schemas']['ExcelDataSource']
  | components['schemas']['CSVDataSource'];
export type ProjectInferDatasetModel =
  components['schemas']['CheckDatasetResource'];
export type DescriptiveStatisticsModel =
  components['schemas']['InferDatasetDescriptiveStatisticsResource'];

export type CategoricalSchemaColumnModel =
  components['schemas']['CategoricalSchemaColumn-Output'];
export type ContinuousSchemaColumnModel =
  components['schemas']['ContinuousSchemaColumn-Output'];
export type GeospatialSchemaColumnModel =
  components['schemas']['GeospatialSchemaColumn-Output'];
export type MultiCategoricalSchemaColumnModel =
  components['schemas']['MultiCategoricalSchemaColumn-Output'];
export type OrderedCategoricalSchemaColumnModel =
  components['schemas']['OrderedCategoricalSchemaColumn-Output'];
export type TemporalSchemaColumnModel =
  components['schemas']['TemporalSchemaColumn-Output'];
export type TextualSchemaColumnModel =
  components['schemas']['TextualSchemaColumn-Output'];
export type TopicSchemaColumnModel =
  components['schemas']['TopicSchemaColumn-Output'];
export type UniqueSchemaColumnModel =
  components['schemas']['UniqueSchemaColumn-Output'];

export type SchemaColumnModel =
  | CategoricalSchemaColumnModel
  | ContinuousSchemaColumnModel
  | GeospatialSchemaColumnModel
  | MultiCategoricalSchemaColumnModel
  | OrderedCategoricalSchemaColumnModel
  | TemporalSchemaColumnModel
  | TextualSchemaColumnModel
  | TopicSchemaColumnModel
  | UniqueSchemaColumnModel;

export type ProjectMutationInput = components['schemas']['Config-Input'];
export type ProjectCheckDatasetInput =
  components['schemas']['CheckDatasetSchema'];

function projectDependencyPredicate(query: Query): boolean {
  const secondPart = query.queryKey?.[1];
  const hasSecondPart = !!secondPart;
  if (!hasSecondPart) {
    return false;
  }
  const secondPartIsString = typeof secondPart === 'string';
  if (!secondPartIsString) {
    return false;
  }
  const mentionsProjectId = secondPart.includes('projectId');
  return mentionsProjectId;
}

export function invalidateProjectDependencyQueries() {
  queryClient.invalidateQueries({
    predicate: projectDependencyPredicate,
  });
}
export function removeProjectDependencyQueries() {
  queryClient.removeQueries({
    predicate: projectDependencyPredicate,
  });
}
