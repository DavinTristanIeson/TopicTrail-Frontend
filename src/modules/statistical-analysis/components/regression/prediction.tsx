import { ComparisonStateItemModel } from '@/api/comparison';
import { useVisibleComparisonGroups } from '@/modules/comparison/app-state';
import {
  Alert,
  Stack,
  Title,
  Text,
  Card,
  ActionIcon,
  Group,
  Button,
  Divider,
} from '@mantine/core';
import { CheckCircle, Info, XCircle } from '@phosphor-icons/react';
import React from 'react';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { RegressionModelType } from './types';
import REGRESSION_MODEL_CONFIG from './regression-model-config';

interface RegressionModelPredictionInputCardProps {
  setInputState: React.Dispatch<React.SetStateAction<boolean[]>>;
  inputState: boolean[];
  variable: ComparisonStateItemModel;
  index: number;
}

function RegressionModelPredictionInputCard(
  props: RegressionModelPredictionInputCardProps,
) {
  const { inputState, setInputState, variable, index } = props;
  return (
    <Card>
      <Group>
        <ActionIcon
          onClick={() =>
            setInputState((inputState) => {
              const newState = inputState.slice();
              newState[index] = !newState[index];
              return newState;
            })
          }
        >
          {inputState[index] ? <CheckCircle /> : <XCircle />}
        </ActionIcon>
        <Text>{variable.name}</Text>
      </Group>
    </Card>
  );
}

interface RegressionModelPredictionSectionProps
  extends BaseStatisticalAnalysisResultRendererProps<any, any> {
  modelId: string;
  modelType: RegressionModelType;
  reference: string | null;
}

function RegressionModelPredictionSection(
  props: RegressionModelPredictionSectionProps,
) {
  const { modelType, config, modelId, reference } = props;
  const configEntry = REGRESSION_MODEL_CONFIG[modelType];
  const { usePredictionAPI, PredictionsRenderer } = configEntry;

  const independentVariables = useVisibleComparisonGroups().filter(
    (group) => group.name !== reference,
  );
  const [inputState, setInputState] = React.useState(
    Array(independentVariables.length).fill(false),
  );

  const { data, execute, loading } = usePredictionAPI({
    config,
    input: {
      model_id: modelId,
      input: inputState.map((input) => Number(input)),
    },
  });

  return (
    <Stack>
      <Text c="gray">
        Choose the subdatasets to be used as input of the prediction task.
      </Text>
      {independentVariables.map((variable, idx) => {
        return (
          <RegressionModelPredictionInputCard
            key={variable.name}
            setInputState={setInputState}
            index={idx}
            inputState={inputState}
            variable={variable}
          />
        );
      })}
      <Button loading={loading} onClick={execute}>
        Predict
      </Button>
      {data && (
        <>
          <Divider />
          <PredictionsRenderer config={config} result={data as any} />
        </>
      )}
    </Stack>
  );
}

export default function RegressionModelPredictionTab(
  props: RegressionModelPredictionSectionProps,
) {
  const { data, modelType, config } = props;
  const configEntry = REGRESSION_MODEL_CONFIG[modelType];
  const { DefaultPredictionsRenderer } = configEntry;

  return (
    <div>
      <Title order={3}>Model Predictions</Title>
      <Stack>
        <Title order={4}>Model Predictions Per Independent Variable</Title>
        <Alert icon={<Info />} color="blue">
          The plot below shows the predictions of the model when the only input
          is a single independent variable. Use this to gauge the individual
          effects of each independent variable.
        </Alert>
        <DefaultPredictionsRenderer config={config} data={data} />

        <Divider />
        <Title order={4}>Model Predictions</Title>
        <Alert icon={<Info />} color="blue">
          If your independent variables (subdatasets) are not mutually
          exclusive, you can test out how combinations of the independent
          variables can affect the model&apos;s prediction. This may be more
          useful with multinomial logistic regression and ordinal regression
          that produces probability distributions for you to consider in your
          analysis.
        </Alert>
        <RegressionModelPredictionSection {...props} />
      </Stack>
    </div>
  );
}
