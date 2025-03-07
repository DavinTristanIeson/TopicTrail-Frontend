import { Expose, Type } from 'class-transformer';
import { PaginatedInput } from '../common';

// Model
export class TopicModel {
  id: number;
  words: [string, number][];
  label: string | null;
  frequency: number;
  children: TopicModel[] | null;

  get isBase() {
    return this.children == null;
  }

  *iterateBaseTopics(): Iterable<TopicModel> {
    if (this.children == null) {
      yield this;
    } else {
      for (const child in this.children) {
        yield* this.iterateBaseTopics();
      }
    }
  }

  *iterateAllTopics(): Iterable<TopicModel> {
    const bfsq: TopicModel[] = [this];
    yield this;
    while (bfsq.length > 0) {
      const current = bfsq.shift();
      if (current?.children == null) {
        continue;
      }
      for (const child of current.children) {
        yield child;
        bfsq.push(child);
      }
    }
  }
}

export class TopicModelingResultModel {
  @Expose({ name: 'project_id' })
  projectId: string;

  @Type(() => TopicModel)
  topics: TopicModel[];

  @Expose({ name: 'valid_count' })
  validCount: number;

  @Expose({ name: 'outlier_count' })
  outlierCount: number;

  @Expose({ name: 'invalid_count' })
  invalidCount: number;

  @Expose({ name: 'total_count' })
  totalCount: number;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  createdAt: Date;

  *iterateBaseTopics(): Iterable<TopicModel> {
    for (const topic of this.topics) {
      yield* topic.iterateBaseTopics();
    }
  }
  *iterateAllTopics(): Iterable<TopicModel> {
    for (const topic of this.topics) {
      yield* topic.iterateAllTopics();
    }
  }
}

export class DocumentPerTopicModel {
  id: number;
  original: string;
  preprocessed: string;
  topic: number;
}

// Input
export interface StartTopicModelingInput {
  useCachedDocumentEmbeddings: boolean;
  usePreprocessedDocuments: boolean;
  useCachedUmapEmbeddings: boolean;
  targets: string[] | null;
}

export interface DocumentsPerTopicQueryInput extends PaginatedInput {
  projectId: string;
  column: string;
  topic: number;
}

interface TopicUpdateInput {
  id: number;
  label: string | null;
  children: TopicUpdateInput[] | null;
}

export interface RefineTopicHierarchyInput {
  projectId: string;
  column: string;
  topics: TopicUpdateInput[];
}

export interface RefineDocumentTopicAssignmentsInput {
  projectId: string;
  column: string;
  documentTopics: {
    documentId: number;
    topicId: number;
  }[];
  newTopics: {
    id: number;
    label: string;
  }[];
}
