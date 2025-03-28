import { DictionarySchema, yupNullableString } from '@/common/utils/form';
import { ReplaceKeys } from '@/common/utils/types';
import * as Yup from 'yup';

const topicUpdateFormSchema = Yup.object({
  id: Yup.number().integer().required(),
  label: yupNullableString,
}).required();

export const refineTopicsFormSchema = Yup.object({
  topics: Yup.array(topicUpdateFormSchema).required(),
  document_topics: DictionarySchema(Yup.number().required()),
}).required();

export type TopicUpdateFormType = Yup.InferType<typeof topicUpdateFormSchema>;
export type RefineTopicsFormType = ReplaceKeys<
  Yup.InferType<typeof refineTopicsFormSchema>,
  {
    document_topics: Record<string, number>;
  }
>;
