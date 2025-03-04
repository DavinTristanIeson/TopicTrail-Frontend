/** Adapted from https://github.com/mantinedev/mantine/tree/master/packages/%40mantine/core/src/components/Combobox/OptionsDropdown */
/* MIT License

Copyright (c) 2021 Vitaly Rtishchev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import {
  ComboboxItem,
  ComboboxParsedItem,
  ComboboxParsedItemGroup,
} from '@mantine/core';

export interface FilterOptionsInput {
  options: ComboboxParsedItem[];
  search: string;
  limit: number;
}

export function isOptionsGroup(
  item: ComboboxParsedItem,
): item is ComboboxParsedItemGroup {
  return 'group' in item;
}

export function defaultOptionsFilter({
  options,
  search,
  limit,
}: FilterOptionsInput): ComboboxParsedItem[] {
  const parsedSearch = search.trim().toLowerCase();
  const result: ComboboxParsedItem[] = [];

  for (let i = 0; i < options.length; i += 1) {
    const item = options[i];

    if (result.length === limit) {
      return result;
    }

    if (isOptionsGroup(item)) {
      result.push({
        group: item.group,
        items: defaultOptionsFilter({
          options: item.items,
          search,
          limit: limit - result.length,
        }) as ComboboxItem[],
      });
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }

  return result;
}

export function isEmptyComboboxData(data: ComboboxParsedItem[]) {
  if (data.length === 0) {
    return true;
  }

  for (const item of data) {
    if (!('group' in item)) {
      return false;
    }

    if ((item as ComboboxParsedItemGroup).items.length > 0) {
      return false;
    }
  }

  return true;
}

export function validateOptions(options: any[], valuesSet = new Set()) {
  if (!Array.isArray(options)) {
    return;
  }

  for (const option of options) {
    if (isOptionsGroup(option)) {
      validateOptions(option.items, valuesSet);
    } else {
      if (typeof option.value === 'undefined') {
        throw new Error('[@mantine/core] Each option must have value property');
      }

      if (typeof option.value !== 'string') {
        throw new Error(
          `[@mantine/core] Option value must be a string, other data formats are not supported, got ${typeof option.value}`,
        );
      }

      if (valuesSet.has(option.value)) {
        throw new Error(
          `[@mantine/core] Duplicate options are not supported. Option with value "${option.value}" was provided more than once`,
        );
      }

      valuesSet.add(option.value);
    }
  }
}

interface FilterPickedTagsInput {
  data: ComboboxParsedItem[];
  value: string[];
}

export function filterPickedValues({ data, value }: FilterPickedTagsInput) {
  const normalizedValue = value.map((item) => item.trim().toLowerCase());

  const filtered = data.reduce<ComboboxParsedItem[]>((acc, item) => {
    if (isOptionsGroup(item)) {
      acc.push({
        group: item.group,
        items: item.items.filter(
          (option) =>
            normalizedValue.indexOf(option.value.toLowerCase().trim()) === -1,
        ),
      });
    } else if (
      normalizedValue.indexOf(item.value.toLowerCase().trim()) === -1
    ) {
      acc.push(item);
    }

    return acc;
  }, []);

  return filtered;
}
