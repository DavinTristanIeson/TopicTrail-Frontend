import Colors from '@/common/constants/colors';
import {
  HoverCard,
  Group,
  Checkbox,
  Stack,
  Text,
  Paper,
  Button,
} from '@mantine/core';
import { DoorOpen, Info } from '@phosphor-icons/react';
import { useStartTopicModeling } from '../behavior/procedure';
import React from 'react';
import { TextualSchemaColumnModel } from '@/api/project';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import { useTopicAppState } from '../app-state';
import { AllTopicModelingResultContext } from './context';
import { useElementSize } from '@mantine/hooks';
import NavigationRoutes from '@/common/constants/routes';
import { ProjectContext } from '@/modules/project/context';
import { useRouter } from 'next/router';

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
        <Group gap={4} className="w-fit">
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

interface TopicColumnControlsProps {
  Right?: React.ReactNode;
}

export function ProjectFocusedTextualColumnControls(
  props: TopicColumnControlsProps,
) {
  const { Right } = props;
  const topicModelingResults = React.useContext(AllTopicModelingResultContext);

  const column = useTopicAppState((store) => store.column);
  const setColumn = useTopicAppState((store) => store.setColumn);

  const columns = topicModelingResults.map((result) => result.column);
  const firstColumn = columns[0];
  // Focus on the first column
  React.useEffect(() => {
    if (column != null || firstColumn == null) return;
    setColumn(firstColumn);
  }, [column, firstColumn, setColumn]);

  const { height, ref } = useElementSize();

  return (
    <>
      <Paper className="absolute top-0 left-0 w-full p-3" radius={0} ref={ref}>
        <Group justify="space-between">
          <ProjectColumnSelectInput
            data={columns}
            value={column?.name ?? null}
            onChange={(col) => setColumn(col as TextualSchemaColumnModel)}
            allowDeselect={false}
            styles={{
              input: {
                width: 384,
              },
            }}
            disabled={columns.length === 0}
            inputContainer={(children) => (
              <Group>
                <Text c="gray" size="sm">
                  Column
                </Text>
                {children}
              </Group>
            )}
          />
          {Right}
        </Group>
      </Paper>
      <div style={{ height: Math.max(72, height ?? 0) }} />
    </>
  );
}

export function ReturnToTopicsPageButton() {
  const { replace } = useRouter();
  const project = React.useContext(ProjectContext);
  return (
    <Button
      variant="outline"
      leftSection={<DoorOpen />}
      onClick={() => {
        replace({
          pathname: NavigationRoutes.ProjectTopics,
          query: {
            id: project.id,
          },
        });
      }}
    >
      Return
    </Button>
  );
}
