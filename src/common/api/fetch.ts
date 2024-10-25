import { plainToInstance } from "class-transformer";
import { client } from "./ky-client";
import { toApiError } from "./utils";
import { KyInstance, Options } from "ky";
import { decamelizeKeys } from "humps";

interface CommonQueryFunctionProps {
  url: string;
  params?: Record<string, any>;
  method: Options["method"];
  classType: (new (...args: any) => any) | undefined;
  body?: any;
  client?: KyInstance;
}

export async function ApiFetch(props: CommonQueryFunctionProps): Promise<any> {
  const usedClient: KyInstance = props.client ?? client;
  const clientProps: Options = {method: props.method}
  if (props.params) {
    clientProps.searchParams = props.params;
  }
  if (props.body){
    clientProps.json = decamelizeKeys(props.body);
  }
  try {
    const response = await usedClient(props.url, clientProps);
    const result = await response.json() as any;
    const data = props.classType ? plainToInstance(props.classType, result.data) : result.data;
    return {
      data,
      ...result
    }
  } catch (e: any) {
    throw await toApiError(e);
  }
}
