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
import { ProjectConfigModel, ProjectMutationInput } from '@/api/project';
import { FormEditableContext } from '@/components/standard/fields/context';

interface ProjectConfigFormProps {
  data?: ProjectConfigModel;
  onSubmit(result: ProjectMutationInput): void;
  children?: React.ReactNode;
}

export default function ProjectConfigForm(props: ProjectConfigFormProps) {
  const { data, onSubmit, children } = props;
  const resolver = yupResolver(ProjectConfigFormSchema);

  const { editable } = React.useContext(FormEditableContext);

  const defaultValues = React.useMemo(
    () => ProjectConfigDefaultValues(data),
    [data],
  );
  const form = useForm({
    mode: 'onChange',
    resolver,
    defaultValues,
    shouldUnregister: false,
  });

  const handleSubmit = async (values: ProjectConfigFormType) => {
    const formValues = ProjectConfigFormSchema.cast(values, {
      stripUnknown: true,
    });
    const input = ProjectConfigFormType2Input(formValues);
    await onSubmit?.(input);
  };

  React.useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      {children}
    </FormWrapper>
  );
}
