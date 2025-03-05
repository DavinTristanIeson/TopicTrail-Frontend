import { useFormContext, useWatch } from "react-hook-form";
import { ProjectConfigFormType } from "../form-type";
import { ProjectDataSourceModel, useGetProjectDatasetColumnInference } from "@/api/project";

export function useInferProjectDatasetColumn(index: number) {
  const { control } = useFormContext<ProjectConfigFormType>();
  const [source, name, type] = useWatch({
    control,
    name: ['source', `columns.${index}.name`, `columns.${index}.type`],
  });
  const { data: column, isFetching } = useGetProjectDatasetColumnInference({
    column: name,
    dtype: type,
    source: source as ProjectDataSourceModel,
  });
  return { data: column?.data, loading: isFetching };
}


export interface ProjectConfigColumnFormProps {
  index: number;
}