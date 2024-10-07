import { HTTPError, TimeoutError } from 'ky';
import { camelizeKeys} from 'humps';

import { ApiError } from './model';

export function isNetworkError(error: Error | string) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  return (
    // https://medium.com/vinh-rocks/how-to-handle-networkerror-when-using-fetch-ff2663220435
    (typeof error !== 'string' && error.name === 'NetworkError') ||
    // Chrome, Edge, Brave: Failed to fetch
    errorMessage === 'Failed to fetch' ||
    // Firefox: NetworkError when attempting to fetch resource
    errorMessage.includes('NetworkError') ||
    // Safari: Load failed
    errorMessage === 'Load failed' ||
    // Service worker: error
    errorMessage === 'Response served by service worker is an error'
  );
}

export async function toApiError(error: Error): Promise<ApiError> {
  const mError: ApiError = {
    message: error.message,
    original: error,
  };

  if (error instanceof HTTPError) {
    mError.message = error.message;
    try {
      const body = await error.response.json();
      mError.message = body.message;
      mError.statusCode = error.response.status;
      mError.errors = camelizeKeys(body.errors);
    } catch { }
  } else if (error instanceof TimeoutError) {
    mError.message = 'Looks like the server is taking too long to respond';
  } else if (isNetworkError(error)) {
    mError.message = 'Looks like there is problem with the internet connection';
  }
  return mError;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      resolve(reader.result as string);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
  });
}
