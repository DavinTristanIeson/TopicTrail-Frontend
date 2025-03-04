/** Adapted from https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/components/Combobox/OptionsDropdown/OptionsDropdown.tsx */
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
  Combobox,
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  ComboboxParsedItem,
  defaultOptionsFilter,
  CheckIcon,
  ScrollArea,
  ScrollAreaProps,
  isOptionsGroup,
} from '@mantine/core';

import {
  FilterOptionsInput,
  isEmptyComboboxData,
  validateOptions,
} from './OptionsDropdown.utils';

export type OptionsFilter = (input: FilterOptionsInput) => ComboboxParsedItem[];

export interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

export type OptionsData = (ComboboxItem | OptionsGroup)[];

interface OptionProps {
  data: ComboboxItem | OptionsGroup;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  unstyled: boolean | undefined;
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
}

function isValueChecked(
  value: string | string[] | undefined | null,
  optionValue: string,
) {
  return Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue;
}

function Option({
  data,
  withCheckIcon,
  value,
  checkIconPosition,
  unstyled,
  renderOption,
}: OptionProps) {
  if (!isOptionsGroup(data)) {
    const checked = isValueChecked(value, data.value);
    const check = withCheckIcon && checked && (
      // .optionsDropdownCheckIcon
      <CheckIcon className="m_8ee53fc2" />
    );

    const defaultContent = (
      <>
        {checkIconPosition === 'left' && check}
        <span>{data.label}</span>
        {checkIconPosition === 'right' && check}
      </>
    );

    return (
      <Combobox.Option
        value={data.value}
        disabled={data.disabled}
        // .optionsDropdownOption
        className={!unstyled ? 'm_390b5f4' : undefined}
        data-reverse={checkIconPosition === 'right' || undefined}
        data-checked={checked || undefined}
        aria-selected={checked}
        active={checked}
      >
        {typeof renderOption === 'function'
          ? renderOption({ option: data, checked })
          : defaultContent}
      </Combobox.Option>
    );
  }

  const options = data.items.map((item) => (
    <Option
      data={item}
      value={value}
      key={item.value}
      unstyled={unstyled}
      withCheckIcon={withCheckIcon}
      checkIconPosition={checkIconPosition}
      renderOption={renderOption}
    />
  ));

  return <Combobox.Group label={data.group}>{options}</Combobox.Group>;
}

export interface OptionsDropdownProps {
  data: OptionsData;
  filter: OptionsFilter | undefined;
  search: string | undefined;
  limit: number | undefined;
  withScrollArea: boolean | undefined;
  maxDropdownHeight: number | string | undefined;
  hidden?: boolean;
  hiddenWhenEmpty?: boolean;
  filterOptions?: boolean;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  nothingFoundMessage?: React.ReactNode;
  unstyled: boolean | undefined;
  labelId: string | undefined;
  'aria-label': string | undefined;
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
  scrollAreaProps: ScrollAreaProps | undefined;

  Bottom?: React.ReactNode;
  Top?: React.ReactNode;
}

export function OptionsDropdown({
  data,
  hidden,
  hiddenWhenEmpty,
  filter,
  search,
  limit,
  maxDropdownHeight,
  withScrollArea = true,
  filterOptions = true,
  withCheckIcon = false,
  value,
  checkIconPosition,
  nothingFoundMessage,
  unstyled,
  labelId,
  renderOption,
  scrollAreaProps,
  'aria-label': ariaLabel,
  Top,
  Bottom,
}: OptionsDropdownProps) {
  validateOptions(data);

  const shouldFilter = typeof search === 'string';
  const filteredData = shouldFilter
    ? (filter || defaultOptionsFilter)({
        options: data,
        search: filterOptions ? search : '',
        limit: limit ?? Infinity,
      })
    : data;
  const isEmpty = isEmptyComboboxData(filteredData);

  const options = filteredData.map((item) => (
    <Option
      data={item}
      key={isOptionsGroup(item) ? item.group : item.value}
      withCheckIcon={withCheckIcon}
      value={value}
      checkIconPosition={checkIconPosition}
      unstyled={unstyled}
      renderOption={renderOption}
    />
  ));

  return (
    <Combobox.Dropdown hidden={hidden || (hiddenWhenEmpty && isEmpty)}>
      {Top}
      <Combobox.Options labelledBy={labelId} aria-label={ariaLabel}>
        {withScrollArea ? (
          <ScrollArea.Autosize
            mah={maxDropdownHeight ?? 220}
            type="scroll"
            scrollbarSize="var(--combobox-padding)"
            offsetScrollbars="y"
            {...scrollAreaProps}
          >
            {options}
          </ScrollArea.Autosize>
        ) : (
          options
        )}
        {isEmpty && nothingFoundMessage && (
          <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>
        )}
      </Combobox.Options>
      {Bottom}
    </Combobox.Dropdown>
  );
}
