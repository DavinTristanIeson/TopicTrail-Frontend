import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ProjectConfigDefaultValues,
  ProjectConfigFormSchema,
  ProjectConfigFormType,
  ProjectConfigFormType2Input,
} from './form-type';
import { useForm } from 'react-hook-form';
import { ProjectConfigModel, ProjectMutationInput } from '@/api/project/model';
import FormWrapper from '@/components/utility/form/wrapper';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import ProjectConfigFormBody from './project-flow/phase-3';
import { CanChangeColumnTypesContext } from './columns/utils';

interface ProjectConfigFormProps {
  data?: ProjectConfigModel;
  onSubmit(result: ProjectMutationInput): void;
  columnsOnly?: boolean;
  editable?: boolean;
}

export default function ProjectConfigForm(props: ProjectConfigFormProps) {
  const { data, onSubmit, columnsOnly, editable = true } = props;
  const resolver = yupResolver(ProjectConfigFormSchema);

  const form = useForm({
    mode: 'onChange',
    resolver,
    disabled: !editable,
    defaultValues: ProjectConfigDefaultValues(data),
  });

  const handleSubmit = async (values: ProjectConfigFormType) => {
    const input = ProjectConfigFormType2Input(values);
    await onSubmit?.(input);
  };

  React.useEffect(() => {
    if (!editable) {
      form.reset();
    }
  }, [editable]);

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <CanChangeColumnTypesContext.Provider value={!columnsOnly}>
        {!editable || columnsOnly ? (
          <ProjectConfigFormBody />
        ) : (
          <ProjectConfigFormPhaseSwitcher data={data} minPhase={data ? 1 : 0} />
        )}
      </CanChangeColumnTypesContext.Provider>
    </FormWrapper>
  );
}
