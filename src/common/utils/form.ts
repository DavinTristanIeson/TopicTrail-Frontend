import { showNotification } from '@mantine/notifications';
import type { UseFormReturn, UseFormSetError } from 'react-hook-form';

export function formSetErrors(
  errors: { [key: string]: any },
  setError: UseFormSetError<any>,
  parentKey?: string,
) {
  Object.entries(errors).forEach((error) => {
    if (error[1] == null) {
      return;
    }
    if (typeof error[1] === 'object') {
      formSetErrors(
        error[1],
        setError,
        `${parentKey ? parentKey + '.' : ''}${error[0]}`,
      );
    } else {
      if (parentKey) {
        setError(`${parentKey}.${error[0]}`, {
          type: 'manual',
          message: error[1],
        });
      } else {
        setError(error[0], {
          type: 'manual',
          message: error[1],
        });
      }
    }
  });
}

export function handleFormSubmission<T extends (...args: any) => any>(
  fn: T,
  setError: UseFormReturn<any>['setError'],
) {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          message: e.message.toString(),
          color: 'red',
        });
      } else {
        showNotification({
          message: 'An error has occurred during the submission of this form.',
          color: 'red',
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, setError);
      }
    }
  }) as any;
}

import * as Yup from 'yup';

function nullIfNaN(value: number): number | null {
  return value === Number(value) ? value : null;
}

function nullIfFalsey(value: any): any | null {
  return value || null;
}

function nullIfFalseyMixed(value: any): any | null {
  if ((typeof value === 'number' && isNaN(value)) || !value) {
    return null;
  }
  return value;
}

function nullIfEmptyArray(value: any): any | null {
  if (!value || value?.length === 0) {
    return null;
  }
  return value;
}

export const yupNullableNumber = Yup.number().transform(nullIfNaN).nullable();
export const yupNullableString = Yup.string()
  .transform(nullIfFalsey)
  .nullable();
export const yupNullableMixed = Yup.mixed()
  .transform(nullIfFalseyMixed)
  .nullable();
export const yupNullableArray = Yup.array()
  .transform(nullIfEmptyArray)
  .nullable();

/**
 * Applies validation to values in an object schema with arbitrary keys. Since this uses Yup.lazy, it's not as performant if you have many properties to validate
 * https://github.com/jquense/yup/issues/524
 */
export const DictionarySchema = (schema: Yup.AnySchema) => {
  return Yup.lazy((obj) => {
    const result: Record<string, Yup.AnySchema> = Object.create(null);
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (obj[key] === undefined) {
        continue;
      }
      result[key] = schema;
    }
    return Yup.object(result).required();
  });
};

export const rangeSchema = Yup.array(Yup.number().positive().required()).length(
  2,
);
