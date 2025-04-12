import * as Yup from 'yup';
import { DashboardItemTypeEnum } from '../types/dashboard-item-types';
import { yupNullableString } from '@/common/utils/form';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';

export const visualizationConfigFormSchema = Yup.object({
  type: Yup.string().oneOf(Object.values(DashboardItemTypeEnum)).required(),
  column: Yup.string().required(),
  title: Yup.string().required(),
  description: yupNullableString,
  config: Yup.lazy((value, options) => {
    const type = options.context.type;
    const defaultSchema = Yup.object().required();
    if (typeof type !== 'string') {
      return defaultSchema;
    }
    const config = DASHBOARD_ITEM_CONFIGURATION[type as DashboardItemTypeEnum];
    if (!config || !config.configValidator) {
      return defaultSchema;
    }
    return config.configValidator.required();
  }),
});

export type VisualizationConfigFormType = Yup.InferType<
  typeof visualizationConfigFormSchema
>;
