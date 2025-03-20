import { handleFormSubmission } from '@/common/utils/form';
import { classNames } from '@/common/utils/styles';
import { LoadingOverlay } from '@mantine/core';
import React from 'react';
import {
  Form,
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';

interface FormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit(values: T): void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function FormWrapper<T extends FieldValues>(
  props: FormWrapperProps<T>,
) {
  const handleSubmit = props.form.handleSubmit(
    handleFormSubmission(props.onSubmit, props.form.setError),
    console.error,
  );

  const {
    formState: { isSubmitting },
  } = props.form;
  return (
    <FormProvider {...props.form}>
      <Form
        control={props.form.control}
        onSubmit={handleSubmit as any}
        className={classNames('relative', props.className)}
        style={props.style}
      >
        <LoadingOverlay visible={isSubmitting} />
        {props.children}
      </Form>
    </FormProvider>
  );
}
