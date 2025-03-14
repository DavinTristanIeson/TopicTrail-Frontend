import type { paths } from '@/api/openapi';
import GlobalConfig from '../constants/global';
import createOpenApiFetchClient from 'openapi-fetch';
import createOpenApiTanstackQueryClient from 'openapi-react-query';

export const fetchClient = createOpenApiFetchClient<paths>({
  baseUrl: GlobalConfig.ApiUrl,
});
export const client = createOpenApiTanstackQueryClient(fetchClient);
