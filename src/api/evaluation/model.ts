import { Expose } from "class-transformer";

// Model
export class TopicEvaluationModel {
  column: string;
  topics: string[];
  
  @Expose({name: "cv_score"})
  cvScore: number;

  @Expose({name: "topic_diversity_score"})
  topicDiversityScore: number;

  @Expose({name: "cv_topic_scores"})
  cvTopicScores: number[];

  @Expose({name: "cv_barchart"})
  cvBarchart: string;
}
