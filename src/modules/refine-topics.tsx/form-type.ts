import { TopicModel } from '@/api/topic';
import {
  DictionarySchema,
  yupNullableArray,
  yupNullableNumber,
  yupNullableString,
} from '@/common/utils/form';
import * as Yup from 'yup';

export const createNewTopicFormSchema = Yup.object({
  id: Yup.number().integer().required(),
  label: Yup.string(),
  description: yupNullableString,
  tags: yupNullableArray.of(Yup.string().required()),
}).required();

export const topicUpdateFormSchema = Yup.object({
  id: Yup.number().integer().required(),
  label: yupNullableString,
  description: yupNullableString,
  tags: yupNullableArray.of(Yup.string().required()),
}).required();

export const refineTopicsFormSchema = Yup.object({
  topics: Yup.array(topicUpdateFormSchema).required(),
  document_topics: DictionarySchema(yupNullableNumber),
}).required();

export type TopicUpdateFormType = Yup.InferType<
  typeof topicUpdateFormSchema
> & {
  original: TopicModel | null;
};
export type RefineTopicsFormType = {
  topics: TopicUpdateFormType[];
  document_topics: Record<string, number | null>;
};
