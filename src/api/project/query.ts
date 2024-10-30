import { ApiQueryFunction } from "@/common/api/fetch-types";
import { ProjectLiteModel, ProjectModel } from "./model";
import { IdInput } from "../common/model";
import { useQuery } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";
import { StaleTimes } from "../common/query";
import { ApiResult, ExtendedApiResult } from "@/common/api/model";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

export const ProjectQueryKeys = {
  listKey: "getProjects",
  detailKey: "getProject",
  detail(input: IdInput) {
    return [ProjectQueryKeys.detailKey, input.id];
  },
  list(input: { page: number; limit: number }) { // Add this function
    return [ProjectQueryKeys.listKey, { page: input.page, limit: input.limit }];
  }
}

const ENDPOINT = "projects";

export const useGetProjects: ApiQueryFunction<void, ExtendedApiResult<ProjectLiteModel[]>> = function (input, options) {
  const location = useLocation();
  const { page = 1, limit = 10 } = queryString.parse(location.search);

  return useQuery({
    queryKey: ProjectQueryKeys.list({ page: Number(page), limit: Number(limit) }),
    staleTime: StaleTimes.Long,
    ...options,
    queryFn() {
      return ApiFetch({
        url: `${ENDPOINT}?page=${page}&limit=${limit}`,
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