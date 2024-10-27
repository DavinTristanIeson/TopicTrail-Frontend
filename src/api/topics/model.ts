import { ProjectTaskStatus } from "@/common/constants/enum";
import { Expose } from "class-transformer";
import { PlotParams } from "react-plotly.js";

// Model

export class TopicsModel {
  plot: PlotParams;

  topics: string[];

  @Expose({name: "topic_words"})
  topicWords: Record<string, [string, number][]>;

  frequencies: number[];
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

