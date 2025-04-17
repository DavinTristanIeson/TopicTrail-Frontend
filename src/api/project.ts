import { queryClient } from '@/common/api/query-client';
import { components } from './openapi';
import { Query } from '@tanstack/react-query';
import { client } from '@/common/api/client';
import { get, isObject } from 'lodash-es';

export type ProjectModel = components['schemas']['ProjectResource'];
export type ProjectMetadataModel = components['schemas']['ProjectMetadata'];
export type ProjectConfigModel = components['schemas']['Config'];
export type ProjectDataSourceModel =
  | components['schemas']['ExcelDataSource']
  | components['schemas']['CSVDataSource'];
export type ProjectInferDatasetModel =
  components['schemas']['CheckDatasetResource'];

export type CategoricalSchemaColumnModel =
  components['schemas']['CategoricalSchemaColumn'];
export type ContinuousSchemaColumnModel =
  components['schemas']['ContinuousSchemaColumn'];
export type GeospatialSchemaColumnModel =
  components['schemas']['GeospatialSchemaColumn'];
export type OrderedCategoricalSchemaColumnModel =
  components['schemas']['OrderedCategoricalSchemaColumn'];
export type TemporalSchemaColumnModel =
  components['schemas']['TemporalSchemaColumn'];
export type TextualSchemaColumnModel =
  components['schemas']['TextualSchemaColumn-Output'];
export type TopicSchemaColumnModel = components['schemas']['TopicSchemaColumn'];
export type UniqueSchemaColumnModel =
  components['schemas']['UniqueSchemaColumn'];

export type SchemaColumnModel =
  | CategoricalSchemaColumnModel
  | ContinuousSchemaColumnModel
  | GeospatialSchemaColumnModel
  | OrderedCategoricalSchemaColumnModel
  | TemporalSchemaColumnModel
  | TextualSchemaColumnModel
  | TopicSchemaColumnModel
  | UniqueSchemaColumnModel;

export type ProjectMutationInput =
  components['schemas']['ProjectMutationSchema'];
export type ProjectCheckDatasetInput =
  components['schemas']['CheckDatasetSchema'];

function projectDependencyPredicateBuilder(projectId: string) {
  return function predicate(query: Query) {
    const paramsPart = query.queryKey?.[2];
    if (!paramsPart) {
      return false;
    }
    if (!isObject(paramsPart)) {
      return false;
    }
    const queryProjectId = get(paramsPart, 'params.path.project_id');
    return projectId === queryProjectId;
  };
}

export function invalidateProjectDependencyQueries(projectId: string) {
  queryClient.invalidateQueries({
    predicate: projectDependencyPredicateBuilder(projectId),
  });
  queryClient.invalidateQueries({
    queryKey: client.queryOptions('get', '/projects/').queryKey,
  });
}
export function removeProjectDependencyQueries(projectId: string) {
  queryClient.removeQueries({
    predicate: projectDependencyPredicateBuilder(projectId),
  });
  queryClient.invalidateQueries({
    queryKey: client.queryOptions('get', '/projects/').queryKey,
  });
}

export function getTopicColumnName(columnName: string) {
  return `${columnName} (Topic)`;
}

export function getPreprocessedDocumentsColumnName(columnName: string) {
  return `${columnName} (Preprocessed)`;
}
