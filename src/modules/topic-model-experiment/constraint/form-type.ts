import { rangeSchema } from '@/common/utils/form';
import * as Yup from 'yup';

export const TopicModelHyperparameterConstraintSchema = Yup.object({
  n_trials: Yup.number().positive().min(5).required(),
  constraint: Yup.object({
    max_topics: rangeSchema.nullable(),
    min_topic_size: rangeSchema.nullable(),
    topic_confidence_threshold: rangeSchema.nullable(),
  }).required(),
});

export type TopicModelHyperparameterConstraintFormType = Yup.InferType<
  typeof TopicModelHyperparameterConstraintSchema
>;
