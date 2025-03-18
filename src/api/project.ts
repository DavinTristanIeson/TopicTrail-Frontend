import { queryClient } from '@/common/api/query-client';
import { components } from './openapi';
import { Query } from '@tanstack/react-query';
import { client } from '@/common/api/client';

export type ProjectModel = components['schemas']['ProjectResource'];
export type ProjectMetadataModel = components['schemas']['ProjectMetadata'];
export type ProjectConfigModel = components['schemas']['Config'];
export type ProjectDataSourceModel =
  | components['schemas']['ExcelDataSource']
  | components['schemas']['CSVDataSource'];
export type ProjectInferDatasetModel =
  components['schemas']['CheckDatasetResource'];

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

export type ProjectMutationInput =
  components['schemas']['ProjectMutationSchema'];
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

export function invalidateProjectDependencyQueries(projectId: string) {
  queryClient.invalidateQueries({
    predicate: projectDependencyPredicate,
  });
  queryClient.invalidateQueries({
    queryKey: client.queryOptions('get', '/projects/').queryKey,
  });
}
export function removeProjectDependencyQueries(projectId: string) {
  queryClient.removeQueries({
    predicate: projectDependencyPredicate,
  });
  queryClient.invalidateQueries({
    queryKey: client.queryOptions('get', '/projects/').queryKey,
  });
}
