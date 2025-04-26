import { client } from '@/common/api/client';
import React from 'react';
import { ProjectContext } from '../project/context';
import {
  UserDataInput,
  UserDataManagerHookProps,
  UserDataManagerRendererProps,
} from './types';

import { merge } from 'lodash-es';
import { showNotification } from '@mantine/notifications';
import { handleError } from '@/common/utils/error';
import { UserDataModel } from '@/api/userdata';
import { queryClient } from '@/common/api/query-client';

function useUserDataManagerHookRequestBoilerplate() {
  const project = React.useContext(ProjectContext);
  const sharedParams = React.useMemo(() => {
    return {
      params: {
        path: {
          project_id: project.id,
        },
      },
    };
  }, [project.id]);

  const getSharedParamsWithId = React.useCallback(
    (id: string) => {
      return merge(sharedParams, {
        params: {
          path: {
            id,
          },
        },
      });
    },
    [sharedParams],
  );

  return {
    sharedParams,
    getSharedParamsWithId,
  };
}

interface BaseUserDataManagerProps<T> extends UserDataManagerHookProps<T> {
  pathname: 'filters' | 'comparison-state' | 'dashboard';
  label: string;
}

export function useBaseUserDataManager<T>(
  props: BaseUserDataManagerProps<T>,
): UserDataManagerRendererProps<T> {
  const { state, onApply, label, pathname } = props;
  const { sharedParams, getSharedParamsWithId } =
    useUserDataManagerHookRequestBoilerplate();

  const query = client.useQuery(
    'get',
    `/userdata/{project_id}/${pathname}`,
    sharedParams,
    {
      staleTime: 15 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    },
  );
  const data = query.data?.data;

  const invalidateQuery = React.useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: client.queryOptions(
        'get',
        `/userdata/{project_id}/${pathname}`,
        sharedParams,
      ).queryKey,
    });
  }, [pathname, sharedParams]);

  const sharedMutationOptions = {
    onSuccess: invalidateQuery,
  };

  const { mutateAsync: createUserData } = client.useMutation(
    'post',
    `/userdata/{project_id}/${pathname}`,
    sharedMutationOptions,
  );
  const { mutateAsync: updateUserData } = client.useMutation(
    'put',
    `/userdata/{project_id}/${pathname}/{id}`,
    sharedMutationOptions,
  );
  const { mutateAsync: deleteUserData } = client.useMutation(
    'delete',
    `/userdata/{project_id}/${pathname}/{id}`,
    sharedMutationOptions,
  );

  const onSave = React.useCallback(
    async (params: UserDataInput) => {
      try {
        const payload = {
          ...params,
          data: state,
        };

        let res: Awaited<
          ReturnType<typeof createUserData | typeof updateUserData>
        >;
        if (params.id == null) {
          res = await createUserData({
            ...sharedParams,
            body: payload as any,
          });
        } else {
          res = await updateUserData({
            ...getSharedParamsWithId(params.id),
            body: payload as any,
          });
        }
        if (res.message) {
          showNotification({
            message: res.message,
            color: 'green',
          });
        }
      } catch (e) {
        handleError(e);
      }
    },
    [
      createUserData,
      getSharedParamsWithId,
      sharedParams,
      state,
      updateUserData,
    ],
  );

  const onLoad = React.useCallback(
    async (id: string) => {
      if (!data) return;
      const target = data.find((x) => x.id === id);
      if (!target) return;
      try {
        onApply(target.data as T);
        showNotification({
          message: `The ${label} has been successfully loaded.`,
          color: 'green',
        });
        invalidateQuery();
      } catch (e) {
        handleError(e);
      }
    },
    [data, invalidateQuery, label, onApply],
  );

  const onDelete = React.useCallback(
    async (id: string) => {
      try {
        const res = await deleteUserData({
          ...getSharedParamsWithId(id),
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: 'green',
          });
        }
        invalidateQuery();
      } catch (e) {
        handleError(e);
      }
    },
    [deleteUserData, getSharedParamsWithId, invalidateQuery],
  );

  return {
    canSave: state != null,
    onSave,
    onDelete,
    onLoad,
    data: (data ?? []) as unknown as UserDataModel<T>[],
  };
}
