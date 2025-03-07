import { Expose, Type } from 'class-transformer';
import { PaginatedInput } from '../../common';
import { TableFilter } from './filter';
import { SchemaColumnModel } from '@/api/project';
import { TopicModel } from '@/api/topic';

// Model
export class TableColumnValuesModel {
  @Type(() => SchemaColumnModel)
  column: SchemaColumnModel;

  values: (string | number | string[])[];
}

export class TableColumnFrequencyDistributionModel {
  @Type(() => SchemaColumnModel)
  column: SchemaColumnModel;

  values: string[];
  frequencies: number[];
}

export class TableColumnGeographicalPointsModel {
  @Expose({ name: 'latitude_column' })
  @Type(() => SchemaColumnModel)
  latitudeColumn: SchemaColumnModel;

  @Expose({ name: 'longitude_column' })
  @Type(() => SchemaColumnModel)
  longitudeColumn: SchemaColumnModel;

  latitude: number[];
  longitude: number[];
  sizes: number[];
}

export class TableColumnCountsModel {
  @Type(() => SchemaColumnModel)
  column: SchemaColumnModel;

  total: number;
  valid: number;
  invalid: number;
  /** Only available for topics */
  outlier: number | null;
}

class WordValueModel {
  word: string;
  value: number;
}

export class TableColumnWordFrequenciesModel {
  @Type(() => SchemaColumnModel)
  column: SchemaColumnModel;

  @Type(() => WordValueModel)
  words: WordValueModel[];
}

class TopicWordWeightsModel {
  topic: number;

  @Type(() => WordValueModel)
  words: WordValueModel;
}

export class TableColumnTopicWordsModel {
  @Type(() => SchemaColumnModel)
  column: SchemaColumnModel;

  @Type(() => TopicWordWeightsModel)
  topics: TopicWordWeightsModel[];
}

// Input

export interface TableColumnQueryInput {
  projectId: string;
  column: string;
  filter: TableFilter;
}

export interface TableGeoraphicalColumnQueryInput {
  projectId: string;
  latitudeColumn: string;
  longitudeColumn: string;
  filter: TableFilter;
}
