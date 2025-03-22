import {
  ComparisonStatisticTestInput,
  SignificanceResultModel,
  TableComparisonGroupInfoModel,
  TableComparisonResultModel,
} from '@/api/comparison';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import {
  Alert,
  Group,
  LoadingOverlay,
  Paper,
  RingProgress,
  Stack,
  Text,
} from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from './dictionary';
import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';

interface StatisticTestResultRendererProps {
  input: ComparisonStatisticTestInput | null;
}

function GroupCountsInfoCard(props: TableComparisonGroupInfoModel) {
  const totalSize = props.sample_size + props.invalid_size;
  const validProportion = (props.sample_size * 100) / totalSize;
  const invalidProportion = (props.invalid_size * 100) / totalSize;
  return (
    <Paper className="flex-1 p-2">
      <Text ta="center" fw={500}>
        {`Group: ${props.name}`}
      </Text>
      <RingProgress
        label={
          <Text size="xs" ta="center">
            Sample Size
          </Text>
        }
        sections={[
          {
            value: validProportion,
            tooltip: `Used Samples: ${props.sample_size}`,
            color: 'green',
          },
          {
            value: invalidProportion,
            tooltip: `Invalid Samples: ${props.invalid_size}`,
            color: 'red',
          },
        ]}
      />
    </Paper>
  );
}

function SignificanceResultRenderer(props: SignificanceResultModel) {
  const dictionaryEntry =
    STATISTIC_TEST_METHOD_DICTIONARY[props.type as StatisticTestMethodEnum];
  const confidence = (1 - props.p_value) * 100;
  const color = props.p_value < 0.05 ? 'brand.300' : 'brand.600';
  return (
    <>
      <Paper className="flex-1 p-2">
        <Stack>
          <Text ta="center" fw={500}>
            {`Statistic (${dictionaryEntry.label})`}
          </Text>
          <Text size="lg" fw="bold">
            {props.statistic}
          </Text>
        </Stack>
      </Paper>
      <Paper className="flex-1 p-2">
        <Stack justify="center">
          <Text ta="center" fw={500}>
            P-Value
          </Text>
          <Text size="lg" fw="bold" ta="center" c={color}>
            {props.p_value}
          </Text>
          <Text size="sm" fw={500} ta="center">
            Confidence
          </Text>
          <Text size="sm" fw="bold" ta="center" c={color}>
            {`${confidence}%`}
          </Text>
        </Stack>
      </Paper>
    </>
  );
}

function EffectSizeResultRenderer(props: TableComparisonResultModel) {
  const { significance, effect_size } = props;
  const dictionaryEntry =
    EFFECT_SIZE_DICTIONARY[effect_size.type as EffectSizeMethodEnum];
  const color = significance.p_value < 0.05 ? 'brand.300' : 'brand.600';
  return (
    <Paper className="flex-1 p-2">
      <Stack>
        <Text ta="center" fw={500}>
          {`Effect Size (${dictionaryEntry.label})`}
        </Text>
        <Text size="lg" fw="bold" color={color} ta="center">
          {effect_size.value}
        </Text>
      </Stack>
    </Paper>
  );
}

export default function StatisticTestResultRenderer(
  props: StatisticTestResultRendererProps,
) {
  const { input } = props;
  const project = React.useContext(ProjectContext);
  const { data, error, isFetching } = client.useQuery(
    'post',
    '/table/{project_id}/statistic-test',
    {
      body: input as ComparisonStatisticTestInput,
      params: {
        path: {
          project_id: project.id,
        },
      },
    },
    {
      enabled: !!input,
    },
  );
  const warnings = data?.data.warnings;
  if (isFetching) {
    return <LoadingOverlay />;
  }
  if (error) {
    return (
      <Alert
        title="An error occurred while running the statistic test!"
        color="red"
        icon={<Warning size={20} />}
      >
        {error.message}
      </Alert>
    );
  }
  if (!data) {
    return null;
  }
  return (
    <>
      {warnings && warnings.length > 0 && (
        <Alert
          title={`There are ${warnings.length} warning(s) regarding the groups used in this statistic test`}
          color="yellow"
          icon={<Warning size={20} />}
        >
          {warnings.map((warning, index) => (
            <Text key={`${warning}-${index}`}>{warning}</Text>
          ))}
        </Alert>
      )}
      <Group>
        {data?.data.groups.map((group) => (
          <GroupCountsInfoCard key={group.name} {...group} />
        ))}
      </Group>
      <Group>
        <SignificanceResultRenderer {...data?.data.significance} />
        <EffectSizeResultRenderer {...data.data} />
      </Group>
    </>
  );
}
