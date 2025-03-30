import { TopicModel } from '@/api/topic';
import { DictionarySchema } from '@/common/utils/form';
import * as Yup from 'yup';

const topicUpdateFormSchema = Yup.object({
  id: Yup.number().integer().required(),
  label: Yup.string().required(),
}).required();

export const refineTopicsFormSchema = Yup.object({
  topics: Yup.array(topicUpdateFormSchema).required(),
  document_topics: DictionarySchema(Yup.number().required()),
}).required();

export type TopicUpdateFormType = Yup.InferType<
  typeof topicUpdateFormSchema
> & {
  original: TopicModel | null;
};
export type RefineTopicsFormType = {
  topics: TopicUpdateFormType[];
  document_topics: Record<string, number>;
};
