import { ApiQueryFunction } from "@/common/api/fetch-types";
import { VariableAssociationInput, VariableAssociationModel } from "./model";
import { ProjectTaskResult } from "../project/model";
import { useQuery } from "@tanstack/react-query";
import { ApiFetch } from "@/common/api/fetch";

export const VariableAssociationQueryKeys = {
  associationKey: 'getAssociation',
  association(input: VariableAssociationInput){
    return [VariableAssociationQueryKeys.associationKey, input.id, input.column1, input.column2]
  },
}

export function projectAssociationEndpoint(id: string){
  return `projects/${id}/association`;
}

export const useGetVariableAssociationStatus: ApiQueryFunction<VariableAssociationInput, ProjectTaskResult<VariableAssociationModel>> = function (input, options){
  return useQuery({
    ...options,
    queryKey: VariableAssociationQueryKeys.association(input),
    queryFn(){
      return ApiFetch({
        classType: VariableAssociationModel,
        method: 'get',
        params: {
          column1: input.column1,
          column2: input.column2,
        },
        url: projectAssociationEndpoint(input.id)
      });
    }
  });
}
