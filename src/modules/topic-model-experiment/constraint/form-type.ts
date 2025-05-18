import * as Yup from 'yup';

const optionalRangeSchema = Yup.array()
  .transform((value: any[]) =>
    Array.isArray(value)
      ? value.every((inner) => inner == null)
        ? null
        : value
      : value,
  )
  .nullable()
  .of(Yup.number().positive())
  .length(2);

export const TopicModelHyperparameterConstraintSchema = Yup.object({
  n_trials: Yup.number().positive().min(5).required(),
  constraint: Yup.object({
    max_topics: optionalRangeSchema,
    min_topic_size: optionalRangeSchema,
    topic_confidence_threshold: optionalRangeSchema,
  }).required(),
});

export type TopicModelHyperparameterConstraintFormType = Yup.InferType<
  typeof TopicModelHyperparameterConstraintSchema
>;
