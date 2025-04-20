import { generateColorsFromSequence } from '@/common/utils/colors';
import { Alert, Button, Group, MultiSelect, Title } from '@mantine/core';
import { XCircle } from '@phosphor-icons/react';
import chroma from 'chroma-js';
import { groupBy } from 'lodash-es';
import React from 'react';
import ReactWordcloud from 'react-wordcloud';
import { NamedData } from '../../types/base';
import { useDebouncedValue } from '@mantine/hooks';

export interface VisualizationWordCloudItem {
  text: string;
  value: number;
  group?: string;
}

interface VisualizationInternalWordCloudItem
  extends VisualizationWordCloudItem {
  significance: number;
}

interface VisualizationWordCloudRendererProps {
  words: VisualizationWordCloudItem[] | undefined;
  title: string;
  noDataPlaceholder: string;
  groups?: string[];
}

export function VisualizationWordCloudRenderer(
  props: VisualizationWordCloudRendererProps,
) {
  const { words, title, noDataPlaceholder, groups } = props;

  const colorMap = React.useMemo(() => {
    if (!groups) return undefined;
    return generateColorsFromSequence(groups).colorMap;
  }, [groups]);

  const componentWords = React.useMemo<
    VisualizationInternalWordCloudItem[] | undefined
  >(() => {
    if (!words) return undefined;
    const NOT_A_GROUP = 'NOT_A_GROUP';
    const groupedWords = groupBy(words, (word) =>
      word.group ? word.group.toString() : NOT_A_GROUP,
    );
    const maxWordsPerGroup = Math.max(
      1,
      Math.ceil(50 / Object.keys(groupedWords).length),
    );
    const limitedGroupedWords = Object.values(groupedWords).map((words) =>
      words.slice(0, maxWordsPerGroup),
    );

    return limitedGroupedWords.flatMap((words) => {
      const maxValue = words.reduce((acc, cur) => Math.max(acc, cur.value), 0);
      return words.map((word) => {
        const proportion = word.value / maxValue;
        return {
          ...word,
          value: proportion,
          significance: word.value,
        } as VisualizationInternalWordCloudItem;
      });
    });
  }, [words]);

  return (
    <>
      <Title order={3} ta="center">
        {title}
      </Title>
      {componentWords ? (
        <div style={{ minHeight: 512, minWidth: 720 }}>
          <ReactWordcloud
            words={componentWords}
            minSize={[720, 512]}
            callbacks={{
              getWordColor: (rawWord) => {
                const word = rawWord as VisualizationInternalWordCloudItem;
                let color: chroma.Color | undefined = undefined;
                if (word.group != null && colorMap) {
                  const definedColor = colorMap.get(word.group);
                  if (definedColor) {
                    color = chroma(definedColor);
                  }
                  // If not, continue below
                }
                if (color === undefined) {
                  // eslint-disable-next-line import/no-named-as-default-member
                  color = chroma.random();
                }
                color.set('lch.c', word.value);
                return color;
              },
              getWordTooltip: (rawWord) => {
                const word = rawWord as VisualizationInternalWordCloudItem;
                const additionalInfo = [`Value: ${word.significance}`];
                if (word.group) {
                  additionalInfo.push(`Group: ${word.group}`);
                }
                return `${word.text} (${additionalInfo.join(' | ')})`;
              },
            }}
            options={{
              fontFamily: 'Impact',
              deterministic: true,
              rotations: 0,
              fontSizes: [24, 64],
            }}
          />
        </div>
      ) : (
        <Alert
          title="Oops, there are no topic words..."
          color="gray"
          icon={<XCircle />}
        >
          {noDataPlaceholder}
        </Alert>
      )}
    </>
  );
}

interface UseVisualizationSubdatasetsMultiSelectReturn<T> {
  viewedData: NamedData<T>[];
  viewed: string[];
  Component: React.ReactNode;
  options: string[];
}

interface UseVisualizationSubdatasetsMultiSelectParams<T> {
  data: NamedData<T>[];
  withSelectAll?: boolean;
}

export function useVisualizationSubdatasetsMultiSelect<T>(
  props: UseVisualizationSubdatasetsMultiSelectParams<T>,
): UseVisualizationSubdatasetsMultiSelectReturn<T> {
  const { data, withSelectAll = false } = props;
  const options = React.useMemo(
    () => data.map((subdataset) => subdataset.name),
    [data],
  );
  const [viewed, setViewed] = React.useState<string[]>(() =>
    options.slice(0, 3),
  );

  const Component = data.length > 1 && (
    <MultiSelect
      data={options}
      value={viewed}
      onChange={setViewed}
      label="Choose the Subdatasets to Visualize"
      inputContainer={
        withSelectAll
          ? (children) => (
              <Group>
                <div className="flex-1">{children}</div>
                <Button
                  onClick={() => {
                    if (viewed.length === data.length) {
                      setViewed([]);
                    } else {
                      setViewed(data.map((subdataset) => subdataset.name));
                    }
                  }}
                  variant="subtle"
                >
                  {viewed.length === data.length ? 'Deselect' : 'Select'} All
                </Button>
              </Group>
            )
          : undefined
      }
    />
  );

  const [actuallyViewed] = useDebouncedValue(viewed, 800, { leading: false });
  const viewedData = React.useMemo(() => {
    return data.filter((subdataset) =>
      actuallyViewed.includes(subdataset.name),
    );
  }, [actuallyViewed, data]);

  return { viewed: actuallyViewed, Component, viewedData, options };
}
