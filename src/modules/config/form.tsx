import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ProjectConfigDefaultValues,
  ProjectConfigFormSchema,
  ProjectConfigFormType,
  ProjectConfigFormType2Input,
} from './form-type';
import { useForm } from 'react-hook-form';
import FormWrapper from '@/components/utility/form/wrapper';
import ProjectConfigFormPhaseSwitcher from './project-flow';
import ConfigureProjectFlow_ConfigureColumns from './project-flow/phase-3';
import { ProjectConfigModel, CreateProjectInput } from '@/api/project';

interface ProjectConfigFormProps {
  data?: ProjectConfigModel;
  onSubmit(result: CreateProjectInput): void;
  editable?: boolean;
  children?: React.ReactNode;
}

export default function ProjectConfigForm(props: ProjectConfigFormProps) {
  const { data, onSubmit, children, editable = true } = props;
  const resolver = yupResolver(ProjectConfigFormSchema);

  const defaultValues = React.useMemo(
    () => ProjectConfigDefaultValues(data),
    [data],
  );
  const form = useForm({
    mode: 'onChange',
    resolver,
    disabled: !editable,
    defaultValues,
  });

  const handleSubmit = async (values: ProjectConfigFormType) => {
    const input = ProjectConfigFormType2Input(values);
    await onSubmit?.(input);
  };

  React.useEffect(() => {
    if (!editable) {
      form.reset(defaultValues);
    }
  }, [editable]);

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      {children}
    </FormWrapper>
  );
}
