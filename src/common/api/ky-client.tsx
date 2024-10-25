import ky, { Options } from "ky";
import GlobalConfig from "../constants/global";

export const API_PREFIX = "api";
export const KY_BASE_CONFIG: Options = {
  prefixUrl: `${GlobalConfig.ApiUrl}/${API_PREFIX}`,
  timeout: 60000,
  retry: 2,
  headers: {
    Accept: "application/json",
  },
};

export const client = ky.create(KY_BASE_CONFIG);
