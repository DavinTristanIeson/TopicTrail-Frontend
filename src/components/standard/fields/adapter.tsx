import { getAnyError } from '@/common/utils/error';
import { ReplaceKeys } from '@/common/utils/types';
import React, { RefCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';

interface IRHFMantineAdaptableGenericConstraint {
  value?: any;
  onChange?: any;
}

/** Type util to change the input types */
export type IRHFField<T, TType extends string> = ReplaceKeys<
  T,
  {
    type: TType;
  }
>;

// Required props for this component to use RHFMantineAdapter
export interface IRHFMantineAdaptable<
  T extends IRHFMantineAdaptableGenericConstraint,
> {
  // Mantine Constraint
  name: string;
  onChange?: T['onChange'];
  value?: T['value'];
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;

  // Put all custom shared props here.
  noError?: boolean | undefined;
}

interface RHFMantineAdapterConfig<
  T extends IRHFMantineAdaptableGenericConstraint,
> {
  withNestedError?: boolean;
  extractEventValue?(e: Parameters<T['onChange']>[0]): any;
}

interface RHFMantineAdapterReturn {
  name: string;
  value: any;
  onChange(value: any): void;
  disabled: boolean;
  required: boolean;
  error: string | undefined;
  ref: RefCallback<any> | undefined;
}

interface UseRHFMantineAdapterReturn<
  T extends IRHFMantineAdaptableGenericConstraint,
> {
  fieldProps: RHFMantineAdapterReturn;
  restProps: T;
  mergedProps: RHFMantineAdapterReturn & T;
}

export function useRHFMantineAdapter<
  T extends IRHFMantineAdaptableGenericConstraint,
>(
  props: IRHFMantineAdaptable<T>,
  config: RHFMantineAdapterConfig<T>,
): UseRHFMantineAdapterReturn<T> {
  const {
    name,
    disabled: controlledDisabled,
    onChange: controlledOnChange,
    noError,
    required,
    value: controlledValue,
    ...unusedProps
  } = props;
  const { extractEventValue, withNestedError } = config;
  const restProps = unusedProps as T;
  const { control } = useFormContext<any>();
  const {
    field: { onChange, value, ref, disabled: fieldDisabled },
    fieldState: { error: fieldStateError },
    formState: { disabled: formDisabled, isSubmitting: formIsSubmitting },
  } = useController({ name, control });

  const disabled =
    !!controlledDisabled || !!fieldDisabled || formDisabled || formIsSubmitting;
  const error = noError
    ? undefined
    : withNestedError
      ? getAnyError(fieldStateError)?.message
      : fieldStateError?.message;
  if ('placeholder' in restProps && disabled) {
    restProps.placeholder = undefined;
  }

  const fieldProps: RHFMantineAdapterReturn = {
    disabled,
    onChange(e) {
      onChange(extractEventValue ? extractEventValue(e) : e?.target?.value);
      controlledOnChange?.(e);
    },
    value: controlledValue ?? value,
    error,
    name,
    required: !disabled ? !!required : false,
    ref,
  };

  return {
    fieldProps,
    restProps,
    mergedProps: {
      ...restProps,
      ...fieldProps,
    },
  };
}

type RHFMantineAdapterProps<TProps extends IRHFMantineAdaptable<any>> = {
  props: TProps;
  config: RHFMantineAdapterConfig<TProps>;
  children(props: RHFMantineAdapterReturn & TProps): React.ReactNode;
};

export function RHFMantineAdapter<T extends IRHFMantineAdaptable<any>>(
  props: RHFMantineAdapterProps<T>,
) {
  const { props: componentProps, config, children } = props;
  const { mergedProps } = useRHFMantineAdapter(componentProps, config);
  return children(mergedProps);
}
