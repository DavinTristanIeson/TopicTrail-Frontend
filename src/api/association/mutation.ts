import { ApiMutationFunction } from "@/common/api/fetch-types";
import { ApiResult } from "@/common/api/model";
import { VariableAssociationInput } from "./model";
import { useMutation } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { projectAssociationEndpoint, VariableAssociationQueryKeys } from "./query";
import { queryClient } from "@/common/api/query-client";

export const useSendVariableAssociationRequest: ApiMutationFunction<VariableAssociationInput, ApiResult<void>> = function (options) {
  return useMutation({
    ...options,
    mutationFn(body) {
      return ApiFetch({
        url: `${projectAssociationEndpoint(body.id)}`,
        params: {
          column1: body.column1,
          column2: body.column2,
        },
        classType: undefined,
        method: 'post',
      });
    },
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: VariableAssociationQueryKeys.association(variables),
      });
    },
  });
}