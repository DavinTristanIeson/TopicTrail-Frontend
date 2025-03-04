// https://github.com/mantinedev/mantine/blob/master/packages/@mantine/core/src/components/Select/Select.tsx

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
  BoxProps,
  ElementProps,
  Factory,
  factory,
  StylesApiProps,
  useProps,
  useResolvedStylesApi,
  __CloseButtonProps,
  ScrollAreaProps,
  __BaseInputProps,
  __InputStylesNames,
  InputVariant,
  InputBase,
  Combobox,
  ComboboxItem,
  ComboboxLikeProps,
  ComboboxLikeRenderOptionInput,
  ComboboxLikeStylesNames,
  getOptionsLockup,
  getParsedComboboxData,
  useCombobox,
} from '@mantine/core';
import { useId, usePrevious, useUncontrolled } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';

import { OptionsDropdown } from './OptionsDropdown';

export type SelectStylesNames = __InputStylesNames | ComboboxLikeStylesNames;

export interface SelectProps
  extends BoxProps,
    __BaseInputProps,
    ComboboxLikeProps,
    StylesApiProps<SelectFactory>,
    ElementProps<'input', 'onChange' | 'size' | 'value' | 'defaultValue'> {
  /** Controlled component value */
  value?: string | null;

  /** Uncontrolled component default value */
  defaultValue?: string | null;

  /** Called when value changes */
  onChange?: (value: string | null, option: ComboboxItem) => void;

  /** Called when the clear button is clicked */
  onClear?: () => void;

  /** Determines whether the select should be searchable, `false` by default */
  searchable?: boolean;

  /** Determines whether check icon should be displayed near the selected option label, `true` by default */
  withCheckIcon?: boolean;

  /** Position of the check icon relative to the option label, `'left'` by default */
  checkIconPosition?: 'left' | 'right';

  /** Message displayed when no option matches the current search query while the `searchable` prop is set or there is no data */
  nothingFoundMessage?: React.ReactNode;

  /** Controlled search value */
  searchValue?: string;

  /** Default search value */
  defaultSearchValue?: string;

  /** Called when search changes */
  onSearchChange?: (value: string) => void;

  /** Determines whether it should be possible to deselect value by clicking on the selected option, `true` by default */
  allowDeselect?: boolean;

  /** Determines whether the clear button should be displayed in the right section when the component has value, `false` by default */
  clearable?: boolean;

  /** Props passed down to the clear button */
  clearButtonProps?: __CloseButtonProps & ElementProps<'button'>;

  /** Props passed down to the hidden input */
  hiddenInputProps?: Omit<React.ComponentPropsWithoutRef<'input'>, 'value'>;

  /** A function to render content of the option, replaces the default content of the option */
  renderOption?: (
    item: ComboboxLikeRenderOptionInput<ComboboxItem>,
  ) => React.ReactNode;

  /** Props passed down to the underlying `ScrollArea` component in the dropdown */
  scrollAreaProps?: ScrollAreaProps;

  Bottom?: React.ReactNode;
  Top?: React.ReactNode;
}

export type SelectFactory = Factory<{
  props: SelectProps;
  ref: HTMLInputElement;
  stylesNames: SelectStylesNames;
  variant: InputVariant;
}>;

const defaultProps: Partial<SelectProps> = {
  searchable: true,
  withCheckIcon: true,
  allowDeselect: true,
  checkIconPosition: 'left',
};

export const Select = factory<SelectFactory>((_props, ref) => {
  const props = useProps('Select', defaultProps, _props);
  const {
    classNames,
    styles,
    unstyled,
    vars,
    dropdownOpened,
    defaultDropdownOpened,
    onDropdownClose,
    onDropdownOpen,
    onFocus,
    onBlur,
    onClick,
    onChange,
    data,
    value,
    defaultValue,
    selectFirstOptionOnChange,
    onOptionSubmit,
    comboboxProps,
    readOnly,
    disabled,
    filter,
    limit,
    withScrollArea,
    maxDropdownHeight,
    size,
    searchable,
    rightSection,
    checkIconPosition,
    withCheckIcon,
    nothingFoundMessage,
    name,
    form,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    allowDeselect,
    error,
    rightSectionPointerEvents,
    id,
    clearable,
    clearButtonProps,
    hiddenInputProps,
    renderOption,
    onClear,
    autoComplete,
    scrollAreaProps,
    Bottom,
    Top,
    ...others
  } = props;

  const parsedData = useMemo(() => getParsedComboboxData(data), [data]);
  const optionsLockup = useMemo(
    () => getOptionsLockup(parsedData),
    [parsedData],
  );
  const _id = useId(id);

  const [_value, setValue, controlled] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange,
  });

  const selectedOption =
    typeof _value === 'string' ? optionsLockup[_value] : undefined;
  const previousSelectedOption = usePrevious(selectedOption);

  const [search, setSearch] = useUncontrolled({
    value: searchValue,
    defaultValue: defaultSearchValue,
    finalValue: selectedOption ? selectedOption.label : '',
    onChange: onSearchChange,
  });

  const combobox = useCombobox({
    opened: dropdownOpened,
    defaultOpened: defaultDropdownOpened,
    onDropdownOpen: () => {
      onDropdownOpen?.();
      combobox.updateSelectedOptionIndex('active', { scrollIntoView: true });
    },
    onDropdownClose: () => {
      onDropdownClose?.();
      combobox.resetSelectedOption();
    },
  });

  const { resolvedClassNames, resolvedStyles } =
    useResolvedStylesApi<SelectFactory>({
      props,
      styles,
      classNames,
    });

  useEffect(() => {
    if (selectFirstOptionOnChange) {
      combobox.selectFirstOption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFirstOptionOnChange, _value]);

  useEffect(() => {
    if (!value) {
      setSearch('');
    }

    if (
      typeof value === 'string' &&
      selectedOption &&
      (previousSelectedOption?.value !== selectedOption.value ||
        previousSelectedOption?.label !== selectedOption.label)
    ) {
      setSearch(selectedOption.label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedOption]);

  const clearButton = clearable && !!_value && !disabled && !readOnly && (
    <Combobox.ClearButton
      size={size as string}
      {...clearButtonProps}
      onClear={() => {
        setValue(null, null);
        setSearch('');
        onClear?.();
      }}
    />
  );

  return (
    <>
      <Combobox
        store={combobox}
        __staticSelector="Select"
        classNames={resolvedClassNames}
        styles={resolvedStyles}
        unstyled={unstyled}
        readOnly={readOnly}
        onOptionSubmit={(val) => {
          onOptionSubmit?.(val);
          const optionLockup = allowDeselect
            ? optionsLockup[val].value === _value
              ? null
              : optionsLockup[val]
            : optionsLockup[val];

          const nextValue = optionLockup ? optionLockup.value : null;

          nextValue !== _value && setValue(nextValue, optionLockup);
          !controlled &&
            setSearch(
              typeof nextValue === 'string' ? optionLockup?.label || '' : '',
            );
          combobox.closeDropdown();
        }}
        size={size}
        {...comboboxProps}
      >
        <Combobox.Target
          targetType={searchable ? 'input' : 'button'}
          autoComplete={autoComplete}
        >
          <InputBase
            id={_id}
            ref={ref}
            rightSection={
              rightSection ||
              clearButton || (
                <Combobox.Chevron
                  size={size}
                  error={error}
                  unstyled={unstyled}
                />
              )
            }
            // rightSectionPointerEvents={
            //   rightSectionPointerEvents || (clearButton ? 'all' : 'none')
            // }
            rightSectionPointerEvents={rightSectionPointerEvents}
            {...others}
            size={size}
            __staticSelector="Select"
            disabled={disabled}
            readOnly={readOnly || !searchable}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              combobox.openDropdown();
              selectFirstOptionOnChange && combobox.selectFirstOption();
            }}
            onFocus={(event) => {
              searchable && combobox.openDropdown();
              onFocus?.(event);
            }}
            onBlur={(event) => {
              // searchable && combobox.closeDropdown();
              setSearch(
                _value != null ? optionsLockup[_value]?.label || '' : '',
              );
              onBlur?.(event);
            }}
            onClick={(event) => {
              if (searchable) {
                combobox.openDropdown();
              } else {
                combobox.toggleDropdown();
              }
              onClick?.(event);
            }}
            classNames={resolvedClassNames}
            styles={resolvedStyles}
            unstyled={unstyled}
            pointer={!searchable}
            error={error}
          />
        </Combobox.Target>
        <OptionsDropdown
          data={parsedData}
          hidden={readOnly || disabled}
          filter={filter}
          search={search}
          limit={limit}
          hiddenWhenEmpty={!nothingFoundMessage}
          withScrollArea={withScrollArea}
          maxDropdownHeight={maxDropdownHeight}
          filterOptions={searchable && selectedOption?.label !== search}
          value={_value}
          checkIconPosition={checkIconPosition}
          withCheckIcon={withCheckIcon}
          nothingFoundMessage={nothingFoundMessage}
          unstyled={unstyled}
          labelId={others.label ? `${_id}-label` : undefined}
          aria-label={others.label ? undefined : others['aria-label']}
          renderOption={renderOption}
          scrollAreaProps={scrollAreaProps}
          Top={Top}
          Bottom={Bottom}
        />
      </Combobox>
      <Combobox.HiddenInput
        value={_value}
        name={name}
        form={form}
        disabled={disabled}
        {...hiddenInputProps}
      />
    </>
  );
});

Select.classes = { ...InputBase.classes, ...Combobox.classes };
Select.displayName = '@mantine/core/Select';
