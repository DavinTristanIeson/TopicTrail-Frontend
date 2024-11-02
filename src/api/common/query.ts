import { ApiQueryFunction } from "@/common/api/fetch-types"
import { EnumModel } from "./model"
import { ApiResult } from "@/common/api/model"
import { ApiFetch } from "@/common/api/fetch"
import { useQuery } from "@tanstack/react-query"

export const StaleTimes = {
  Long: 15 * 60 * 1000,
  Medium: 5 * 60 * 1000,
  Short: 1 * 60 * 1000,
}

const ENDPOINT = "enums"
export const useGetEnum: ApiQueryFunction<string, ApiResult<EnumModel[]>> = function (input, options) {
  return useQuery({
    ...options,
    queryKey: ['getEnums', input],
    staleTime: Infinity,
    queryFn() {
      return ApiFetch({
        classType: EnumModel,
        method: 'get',
        url: `${ENDPOINT}/${input}`,
      });
    },
  });
}