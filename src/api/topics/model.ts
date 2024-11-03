import { Expose } from "class-transformer";

// Model

export class TopicsModel {
  column: string;
  
  topics: string[];
  @Expose({name: "topic_words"})
  topicWords: Record<string, [string, number][]>;

  frequencies: number[];

  @Expose({name: "frequency_barchart"})
  frequencyBarchart: string;

  @Expose({name: "topics_barchart"})
  topicsBarchart: string;

  total: number;
  outliers: number;
  valid: number;
  invalid: number;
}

export class TopicSimilarityModel {
  column: string;
  
  heatmap: string;
  ldavis: string;
  dendrogram: string;

  topics: string[];

  @Expose({name: "similarity_matrix"})
  similarityMatrix: number[][];
}


// Input

export interface TopicModelingStatusInput {
  id: string;
}

export interface TopicsInput {
  id: string;
  column: string;
}

