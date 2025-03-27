import GlobalConfig from './global';

export const LocalStorageKeys = {
  SavedFilters: `${GlobalConfig.AppName}__saved-filters`,
  TableDashboard: `${GlobalConfig.AppName}__table--dashboard`,
  ComparisonDashboard: `${GlobalConfig.AppName}__comparison--dashboard`,
  DatasetTablePreviewStates: `${GlobalConfig.AppName}__dataset-preview--column-states`,
};

export const SessionStorageKeys = {
  TableParams: `${GlobalConfig.AppName}__table--params`,
  ComparisonParams: `${GlobalConfig.AppName}__comparison--params`,
};
