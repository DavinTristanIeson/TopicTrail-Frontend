import { ProjectTaskStatus } from "@/common/constants/enum";
import { Expose } from "class-transformer";

// Model

export class TopicsModel {
  plot: string;

  @Expose({name: "topic_words"})
  topicWords: Record<string, [string, number][]>;

  frequencies: Record<string, number>;
  hierarchy: Record<string, string[]>;

  outliers: number;
  total: number;
}

export class TopicSimilarityModel {
  plot: string;
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

