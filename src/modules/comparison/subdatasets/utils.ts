import { ComparisonStateItemModel } from '@/api/comparison';
import React from 'react';
import { useComparisonAppState } from '../app-state';

export function useNegateComparisonSubdataset() {
  const setSubdatasets = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  return React.useCallback(
    (item: ComparisonStateItemModel) => {
      const newName = `Not ${item.name}`;
      let newSubdataset: ComparisonStateItemModel;
      if (item.filter.type === 'not') {
        newSubdataset = {
          name: newName,
          filter: item.filter.operand,
        };
      } else {
        newSubdataset = {
          name: newName,
          filter: {
            type: 'not',
            operand: item.filter,
          },
        };
      }
      setSubdatasets((subdatasets) => {
        const originalIndex = subdatasets.findIndex(
          (subdataset) => subdataset.name === item.name,
        );
        const index = subdatasets.findIndex(
          (subdataset) => subdataset.name === newSubdataset.name,
        );
        if (index === -1) {
          if (originalIndex === -1) {
            return [...subdatasets, newSubdataset];
          } else {
            const newSubdatasets = subdatasets.slice();
            newSubdatasets.splice(originalIndex + 1, 0, newSubdataset);
            return newSubdatasets;
          }
        } else {
          const newSubdatasets = subdatasets.slice();
          newSubdatasets[index] = newSubdataset;
          return newSubdatasets;
        }
      });
    },
    [setSubdatasets],
  );
}

export function useAddSubdatasetByName() {
  const setSubdatasets = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  return React.useCallback(
    (newSubdataset: ComparisonStateItemModel) => {
      setSubdatasets((prev) => {
        const index = prev.findIndex(
          (subdataset) => subdataset.name === newSubdataset.name,
        );
        if (index === -1) {
          return [...prev, newSubdataset];
        } else {
          const next = prev.slice();
          next[index] = newSubdataset;
          return next;
        }
      });
    },
    [setSubdatasets],
  );
}
