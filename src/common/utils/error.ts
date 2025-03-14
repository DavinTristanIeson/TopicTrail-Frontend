import { showNotification } from '@mantine/notifications';
import { FieldError } from 'react-hook-form';
import { isObject } from 'lodash';

export function isFieldError(x: any): x is FieldError {
  return (
    typeof x === 'string' ||
    (!!x?.message && typeof x?.message === 'string' && !!x?.type)
  );
}

function __getAnyErrorRecursive(obj: any): FieldError | undefined {
  for (const key in obj) {
    if (isFieldError(obj[key])) {
      return obj[key];
    }
    if (isObject(obj[key]) || Array.isArray(obj[key])) {
      const result = __getAnyErrorRecursive(obj[key]);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export function getAnyError(errors: any): FieldError | undefined {
  if (!isObject(errors) && !Array.isArray(errors)) {
    return undefined;
  }
  if (isFieldError(errors)) {
    return errors;
  }
  return __getAnyErrorRecursive(errors);
}

function __getAllErrorRecursive(obj: any): FieldError[] {
  const found: FieldError[] = [];
  for (const key in obj) {
    if (isFieldError(obj[key])) {
      found.push(obj[key]);
      continue;
    }
    if (isObject(obj[key]) || Array.isArray(obj[key])) {
      found.push(...__getAllErrorRecursive(obj[key]));
    }
  }
  return found;
}

export function getAllErrors(errors: any): FieldError[] {
  if (!isObject(errors) && !Array.isArray(errors)) {
    return [];
  }
  if (isFieldError(errors)) {
    return [errors];
  }
  return __getAllErrorRecursive(errors);
}

export function handleErrorFn<T extends (...args: any) => any>(fn: T): T {
  return async function (...args: any[]) {
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
          message: 'An unexpected error has occurred.',
          color: 'red',
        });
      }
    }
  } as T;
}
