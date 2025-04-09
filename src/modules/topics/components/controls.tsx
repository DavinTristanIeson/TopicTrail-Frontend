import Colors from '@/common/constants/colors';
import { HoverCard, Group, Checkbox, Stack, Text } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { useStartTopicModeling } from '../behavior/procedure';
import React from 'react';

interface TopicModelingOptionFlagCheckboxProps {
  checked: boolean;
  onChange(flag: boolean): void;
  label: string;
  tooltip: string;
}

function TopicModelingOptionFlagCheckbox(
  props: TopicModelingOptionFlagCheckboxProps,
) {
  return (
    <HoverCard position="left">
      <HoverCard.Target>
        <Group gap={4}>
          <Checkbox
            label={props.label}
            checked={props.checked}
            onChange={(event) => props.onChange(event.currentTarget.checked)}
          />
          <Info color={Colors.brand} />
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown className="max-w-sm">
        <Stack>
          <Text size="sm" fw={500}>
            {props.label}
          </Text>
          <Text size="sm">{props.tooltip}</Text>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

type TopicModelingOptionFlagCheckboxesProps = ReturnType<
  typeof useStartTopicModeling
>;

export function TopicModelingOptionFlagCheckboxes(
  props: TopicModelingOptionFlagCheckboxesProps,
) {
  const {
    shouldUseCachedDocumentVectors,
    shouldUseCachedUMAPVectors,
    shouldUseCachedPreprocessedDocuments,
    setShouldUseCachedDocumentVectors,
    setShouldUseCachedPreprocessedDocuments,
    setShouldUseCachedUMAPVectors,
  } = props;
  const options: TopicModelingOptionFlagCheckboxProps[] = React.useMemo(
    () => [
      {
        checked: shouldUseCachedPreprocessedDocuments,
        onChange: setShouldUseCachedPreprocessedDocuments,
        label: 'Use cached preprocessed documents',
        tooltip:
          'The preprocessing stage can be time-consuming, so we recommend that you reuse the cached preprocessed documents (if they exist). Only uncheck this checkbox if you have changed the preprocessing configuration for this column; otherwise, leave it be.',
      },
      {
        checked: shouldUseCachedDocumentVectors,
        onChange: setShouldUseCachedDocumentVectors,
        label: 'Use cached document vectors',
        tooltip:
          'Computing document vectors (especially with SBERT) can be time-consuming, so we recommend that you reuse cached document vectors. Only uncheck this checkbox if you have changed the topic modeling configuration for this column; otherwise, leave it be.',
      },
      {
        checked: shouldUseCachedUMAPVectors,
        onChange: setShouldUseCachedUMAPVectors,
        label: 'Use cached UMAP vectors',
        tooltip:
          'Reducing the dimensionality of the document vectors can take a long time, so we recommend that you reuse cached UMAP vectors. Only uncheck this checkbox if you have changed the topic modeling configuration for this column; otherwise, leave it be.',
      },
    ],
    [
      setShouldUseCachedDocumentVectors,
      setShouldUseCachedPreprocessedDocuments,
      setShouldUseCachedUMAPVectors,
      shouldUseCachedDocumentVectors,
      shouldUseCachedPreprocessedDocuments,
      shouldUseCachedUMAPVectors,
    ],
  );
  return (
    <Stack>
      {options.map((option) => (
        <TopicModelingOptionFlagCheckbox {...option} key={option.label} />
      ))}
    </Stack>
  );
}
