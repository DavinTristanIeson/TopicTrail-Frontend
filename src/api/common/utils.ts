import { queryClient } from "@/common/api/query-client";

export const StaleTimes = {
  Long: 15 * 60 * 1000,
  Medium: 5 * 60 * 1000,
  Short: 1 * 60 * 1000,
}

export const QueryInvalidator = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Create(listKey: string, detailKey?: string) {
    return {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: [listKey]
        });
      },
    };
  },
  Update(listKey: string, detailKey: string) {
    return {
      onSuccess(_: any, variables: any) {
        queryClient.invalidateQueries({
          queryKey: [listKey]
        });
        if (variables.id) {
          queryClient.invalidateQueries({
            queryKey: [detailKey, variables.id]
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: [detailKey]
          });
        }
      },
    };
  },
  Delete(listKey: string, detailKey: string) {
    return {
      onSuccess(_: any, variables: any) {
        queryClient.invalidateQueries({
          queryKey: [listKey]
        });
        if (variables.id) {
          queryClient.removeQueries({
            queryKey: [detailKey, variables.id]
          });
        }
      },
    };
  },
};
