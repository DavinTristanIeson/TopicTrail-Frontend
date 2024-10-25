import { ApiQueryFunction } from "@/common/api/fetch-types";
import { ProjectLiteModel, ProjectModel } from "./model";
import { IdInput } from "../common/model";
import { useQuery } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { StaleTimes } from "../common/query";
import { ApiResult, ExtendedApiResult } from "@/common/api/model";

export const ProjectQueryKeys = {
  listKey: "getProjects",
  detailKey: "getProject",
  detail(input: IdInput) {
    return [ProjectQueryKeys.detailKey, input.id];
  }
}

const ENDPOINT = "projects";

export const useGetProjects: ApiQueryFunction<void, ExtendedApiResult<ProjectLiteModel[]>> = function (input, options) {
  return useQuery({
    queryKey: [ProjectQueryKeys.listKey],
    staleTime: StaleTimes.Long,
    ...options,
    queryFn() {
      return ApiFetch({
        url: ENDPOINT,
        classType: ProjectLiteModel,
        method: 'get',
      });
    }
  });
}

export const useGetProject: ApiQueryFunction<IdInput, ApiResult<ProjectModel>> = function (input, options) {
  return useQuery({
    queryKey: ProjectQueryKeys.detail(input),
    staleTime: StaleTimes.Long,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${ENDPOINT}/${input.id}`,
        classType: ProjectModel,
        method: 'get',
      });
    }
  });
}