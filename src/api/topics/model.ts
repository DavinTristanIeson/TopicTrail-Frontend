import { Expose } from "class-transformer";

// Model

export class TopicsModel {
  column: string;

  plot: string;
  
  topics: string[];
  @Expose({name: "topic_words"})
  topicWords: Record<string, [string, number][]>;

  frequencies: number[];
  outliers: number;
  total: number;
}

export class TopicSimilarityModel {
  column: string;
  
  heatmap: string;
  ldavis: string;
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

