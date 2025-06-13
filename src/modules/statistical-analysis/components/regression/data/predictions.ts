import { RegressionPredictionInput } from '@/api/statistical-analysis';
import { showNotification } from '@mantine/notifications';
import { UseMutationResult } from '@tanstack/react-query';
import { RegressionPredictionAPIHookType } from '../types';

export function useAdaptMutationToRegressionPredictionAPIResult<T>(
  input: RegressionPredictionInput,
  result: UseMutationResult<
    { data: T },
    any,
    { body: RegressionPredictionInput }
  >,
): ReturnType<RegressionPredictionAPIHookType<T, any>> {
  const { mutateAsync, data, isPending } = result;
  return {
    data: data?.data,
    loading: isPending,
    execute: async () => {
      try {
        await mutateAsync({
          body: input,
        });
      } catch (e: any) {
        if (e.message) {
          showNotification({
            message: e.message,
            color: 'red',
          });
        }
      }
    },
  };
}
