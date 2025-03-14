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
    const input = ProjectConfigFormType2Input(values);
    await onSubmit?.(input);
  };

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [editable]);

  return (
    <div className="px-3 pt-3">
      <FormWrapper form={form} onSubmit={handleSubmit}>
        {children}
      </FormWrapper>
    </div>
  );
}
