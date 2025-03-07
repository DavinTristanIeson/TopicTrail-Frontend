import { queryClient } from "@/common/api/query-client";

export const StaleTimes = {
  Long: 15 * 60 * 1000,
  Medium: 5 * 60 * 1000,
  Short: 1 * 60 * 1000,
}


function invalidatePotentiallyManyListKeys(listKey: string | string[]) {
  if (Array.isArray(listKey)) {
    for (const key of listKey) {
      queryClient.invalidateQueries({
        queryKey: [listKey]
      });
    }
  } else {
    queryClient.invalidateQueries({
      queryKey: [listKey]
    });
  }
}
export const QueryInvalidator = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Create(listKey: string | string[], detailKey?: string) {
    return {
      onSuccess() {
        invalidatePotentiallyManyListKeys(listKey);
      },
    };
  },
  Update(listKey: string | string[], detailKey: string) {
    return {
      onSuccess(_: any, variables: any) {
        invalidatePotentiallyManyListKeys(listKey);
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
  Delete(listKey: string | string[], detailKey: string) {
    return {
      onSuccess(_: any, variables: any) {
        invalidatePotentiallyManyListKeys(listKey);
        if (variables.id) {
          queryClient.removeQueries({
            queryKey: [detailKey, variables.id]
          });
        }
      },
    };
  },
};
