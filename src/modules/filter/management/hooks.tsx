import { TableFilterModel } from '@/api/table';
import { client } from '@/common/api/client';
import { LocalStorageKeys } from '@/common/constants/browser-storage-keys';
import { ProjectContext } from '@/modules/project/context';
import { useLocalStorage } from '@mantine/hooks';
import { isObject } from 'lodash';
import React from 'react';

type SavedFiltersLibraryType = Record<string, TableFilterModel>;

export function useLocallySavedFilters() {
  return useLocalStorage<SavedFiltersLibraryType>({
    key: LocalStorageKeys.SavedFilters,
    serialize(value) {
      return JSON.stringify(value);
    },
    deserialize(value) {
      if (!value) {
        return {};
      }
      const values = JSON.parse(value);
      if (!isObject(values)) {
        return {};
      }
      return values as SavedFiltersLibraryType;
    },
    defaultValue: {},
  });
}

export function useCheckFilterValidity() {
  const { mutateAsync: checkFilter } = client.useMutation(
    'post',
    '/table/{project_id}/check-filter',
  );
  const project = React.useContext(ProjectContext)!;

  return React.useCallback(async (filter: TableFilterModel) => {
    const res = await checkFilter({
      body: filter,
      params: {
        path: {
          project_id: project.id,
        },
      },
    });
    return res.data;
  }, []);
}
